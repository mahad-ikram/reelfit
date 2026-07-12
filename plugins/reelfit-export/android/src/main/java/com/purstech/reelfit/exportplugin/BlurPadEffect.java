package com.purstech.reelfit.exportplugin;

import android.content.Context;
import android.opengl.GLES20;

import androidx.media3.common.VideoFrameProcessingException;
import androidx.media3.common.util.GlProgram;
import androidx.media3.common.util.GlUtil;
import androidx.media3.common.util.Size;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.BaseGlShaderProgram;
import androidx.media3.effect.GlEffect;
import androidx.media3.effect.GlShaderProgram;

/**
 * Reelfit signature effect: fits the video inside a target aspect ratio and
 * fills the padding with a blurred, dimmed, scaled-to-cover copy of the frame.
 * Single decode, single GL pass.
 */
@UnstableApi
public final class BlurPadEffect implements GlEffect {

    private final float targetAspect; // width / height, e.g. 9/16 = 0.5625
    private final float blurRadius;   // in source UV, ~0.012 (soft) to 0.067 (heavy)
    private final float[] bgRgb;      // null = blurred fill; non-null = solid color pads

    public BlurPadEffect(float targetAspect, int blurStrength, float[] bgRgb) {
        this.targetAspect = targetAspect;
        int clamped = Math.max(0, Math.min(100, blurStrength));
        this.blurRadius = 0.012f + (clamped / 100f) * 0.055f;
        this.bgRgb = bgRgb;
    }

    @Override
    public GlShaderProgram toGlShaderProgram(Context context, boolean useHdr)
            throws VideoFrameProcessingException {
        return new BlurPadShaderProgram(useHdr, targetAspect, blurRadius, bgRgb);
    }

    private static final class BlurPadShaderProgram extends BaseGlShaderProgram {

        private static final String VERTEX_SHADER =
                "attribute vec4 aFramePosition;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  gl_Position = aFramePosition;\n"
              + "  vTexCoords = aFramePosition.xy * 0.5 + 0.5;\n"
              + "}\n";

        private static final String FRAGMENT_SHADER =
                "precision mediump float;\n"
              + "uniform sampler2D uTexSampler;\n"
              + "uniform vec2 uBgScale;\n"   // output->source mapping for cover fill
              + "uniform vec2 uFgOrigin;\n"  // fg rect origin in output UV
              + "uniform vec2 uFgSize;\n"    // fg rect size in output UV
              + "uniform float uBlurR;\n"    // blur radius in source UV
              + "uniform float uBgMode;\n"   // 0 = blurred fill, 1 = solid color
              + "uniform vec3 uBgColor;\n"
              + "varying vec2 vTexCoords;\n"
              + "vec4 blurBg(vec2 p) {\n"
              + "  vec4 acc = texture2D(uTexSampler, p) * 0.10;\n"
              + "  float r1 = uBlurR; float r2 = uBlurR * 2.1; float r3 = uBlurR * 3.4;\n"
              + "  for (int i = 0; i < 8; i++) {\n"
              + "    float a = 0.7853982 * float(i);\n"
              + "    vec2 d = vec2(cos(a), sin(a));\n"
              + "    acc += texture2D(uTexSampler, p + d * r1) * 0.055;\n"
              + "    acc += texture2D(uTexSampler, p + d * r2) * 0.036;\n"
              + "    acc += texture2D(uTexSampler, p + d * r3) * 0.0215;\n"
              + "  }\n"
              + "  return acc;\n"
              + "}\n"
              + "void main() {\n"
              + "  vec2 uv = vTexCoords;\n"
              + "  vec2 f = (uv - uFgOrigin) / uFgSize;\n"
              + "  if (f.x >= 0.0 && f.x <= 1.0 && f.y >= 0.0 && f.y <= 1.0) {\n"
              + "    gl_FragColor = texture2D(uTexSampler, f);\n"
              + "  } else if (uBgMode > 0.5) {\n"
              + "    gl_FragColor = vec4(uBgColor, 1.0);\n"
              + "  } else {\n"
              + "    vec2 bgUV = (uv - 0.5) * uBgScale + 0.5;\n"
              + "    vec4 bg = blurBg(bgUV);\n"
              + "    gl_FragColor = vec4(bg.rgb * 0.62, 1.0);\n"
              + "  }\n"
              + "}\n";

        private final float targetAspect;
        private final float blurRadius;
        private final float[] bgRgb;
        private final float bgMode;
        private GlProgram glProgram;
        private float[] bgScale = new float[] {1f, 1f};
        private float[] fgOrigin = new float[] {0f, 0f};
        private float[] fgSize = new float[] {1f, 1f};

        BlurPadShaderProgram(boolean useHdr, float targetAspect, float blurRadius, float[] bgRgb)
                throws VideoFrameProcessingException {
            super(useHdr, /* texturePoolCapacity= */ 1);
            this.targetAspect = targetAspect;
            this.blurRadius = blurRadius;
            this.bgRgb = bgRgb != null ? bgRgb : new float[] {0f, 0f, 0f};
            this.bgMode = bgRgb != null ? 1f : 0f;
            try {
                glProgram = new GlProgram(VERTEX_SHADER, FRAGMENT_SHADER);
                glProgram.setBufferAttribute(
                        "aFramePosition",
                        GlUtil.getNormalizedCoordinateBounds(),
                        GlUtil.HOMOGENEOUS_COORDINATE_VECTOR_SIZE);
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }

        @Override
        public Size configure(int inputWidth, int inputHeight) {
            float inputAspect = (float) inputWidth / inputHeight;
            int outW;
            int outH;
            if (inputAspect > targetAspect) {
                // landscape source into taller canvas: keep width, grow height
                outW = inputWidth;
                outH = Math.round(inputWidth / targetAspect);
            } else {
                // portrait/square source into wider canvas: keep height, grow width
                outH = inputHeight;
                outW = Math.round(inputHeight * targetAspect);
            }
            // cap the long edge at 1920, keep encoder-friendly even dimensions
            float cap = 1920f / Math.max(outW, outH);
            if (cap < 1f) {
                outW = Math.round(outW * cap);
                outH = Math.round(outH * cap);
            }
            outW = outW & ~1;
            outH = outH & ~1;

            float outAspect = (float) outW / outH;
            // foreground: scale-to-fit rect in output UV
            if (inputAspect > outAspect) {
                float h = outAspect / inputAspect;
                fgOrigin = new float[] {0f, (1f - h) / 2f};
                fgSize = new float[] {1f, h};
            } else {
                float w = inputAspect / outAspect;
                fgOrigin = new float[] {(1f - w) / 2f, 0f};
                fgSize = new float[] {w, 1f};
            }
            // background: scale-to-cover sampling window of the source
            bgScale = new float[] {
                    Math.min(1f, outAspect / inputAspect),
                    Math.min(1f, inputAspect / outAspect)
            };
            return new Size(outW, outH);
        }

        @Override
        public void drawFrame(int inputTexId, long presentationTimeUs)
                throws VideoFrameProcessingException {
            try {
                glProgram.use();
                glProgram.setSamplerTexIdUniform("uTexSampler", inputTexId, /* texUnitIndex= */ 0);
                glProgram.setFloatsUniform("uBgScale", bgScale);
                glProgram.setFloatsUniform("uFgOrigin", fgOrigin);
                glProgram.setFloatsUniform("uFgSize", fgSize);
                glProgram.setFloatUniform("uBlurR", blurRadius);
                glProgram.setFloatUniform("uBgMode", bgMode);
                glProgram.setFloatsUniform("uBgColor", bgRgb);
                glProgram.bindAttributesAndUniforms();
                GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, /* first= */ 0, /* count= */ 4);
                GlUtil.checkGlError();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e, presentationTimeUs);
            }
        }

        @Override
        public void release() throws VideoFrameProcessingException {
            super.release();
            try {
                if (glProgram != null) glProgram.delete();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }
    }
}
