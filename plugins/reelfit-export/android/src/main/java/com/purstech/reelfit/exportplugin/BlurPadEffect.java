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
 * Reelfit signature effect v3: fits the video inside a target aspect ratio and
 * fills the padding with a smooth multi-pass Gaussian blur of the frame
 * (downsample -> horizontal blur -> vertical blur -> compose), or a solid color.
 */
@UnstableApi
public final class BlurPadEffect implements GlEffect {

    private final float targetAspect;
    private final int blurStrength; // 0..100
    private final float[] bgRgb;    // null = blurred fill; non-null = solid color pads

    public BlurPadEffect(float targetAspect, int blurStrength, float[] bgRgb) {
        this.targetAspect = targetAspect;
        this.blurStrength = Math.max(0, Math.min(100, blurStrength));
        this.bgRgb = bgRgb;
    }

    @Override
    public GlShaderProgram toGlShaderProgram(Context context, boolean useHdr)
            throws VideoFrameProcessingException {
        return new BlurPadShaderProgram(useHdr, targetAspect, blurStrength, bgRgb);
    }

    private static final class BlurPadShaderProgram extends BaseGlShaderProgram {

        private static final String VERTEX_SHADER =
                "attribute vec4 aFramePosition;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  gl_Position = aFramePosition;\n"
              + "  vTexCoords = aFramePosition.xy * 0.5 + 0.5;\n"
              + "}\n";

        private static final String FRAG_COVER =
                "precision mediump float;\n"
              + "uniform sampler2D uTex;\n"
              + "uniform vec2 uBgScale;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec2 p = (vTexCoords - 0.5) * uBgScale + 0.5;\n"
              + "  gl_FragColor = texture2D(uTex, p);\n"
              + "}\n";

        private static final String FRAG_BLUR =
                "precision mediump float;\n"
              + "uniform sampler2D uTex;\n"
              + "uniform vec2 uDir;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec4 acc = texture2D(uTex, vTexCoords) * 0.2270270270;\n"
              + "  acc += (texture2D(uTex, vTexCoords + uDir * 1.3846153846)\n"
              + "        + texture2D(uTex, vTexCoords - uDir * 1.3846153846)) * 0.3162162162;\n"
              + "  acc += (texture2D(uTex, vTexCoords + uDir * 3.2307692308)\n"
              + "        + texture2D(uTex, vTexCoords - uDir * 3.2307692308)) * 0.0702702703;\n"
              + "  gl_FragColor = acc;\n"
              + "}\n";

        private static final String FRAG_COMPOSE =
                "precision mediump float;\n"
              + "uniform sampler2D uTex;\n"
              + "uniform sampler2D uBg;\n"
              + "uniform vec2 uFgOrigin;\n"
              + "uniform vec2 uFgSize;\n"
              + "uniform float uBgMode;\n"
              + "uniform vec3 uBgColor;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec2 f = (vTexCoords - uFgOrigin) / uFgSize;\n"
              + "  if (f.x >= 0.0 && f.x <= 1.0 && f.y >= 0.0 && f.y <= 1.0) {\n"
              + "    gl_FragColor = texture2D(uTex, f);\n"
              + "  } else if (uBgMode > 0.5) {\n"
              + "    gl_FragColor = vec4(uBgColor, 1.0);\n"
              + "  } else {\n"
              + "    gl_FragColor = vec4(texture2D(uBg, vTexCoords).rgb * 0.90, 1.0);\n"
              + "  }\n"
              + "}\n";

        private final float targetAspect;
        private final float strengthT; // 0..1
        private final float bgMode;
        private final float[] rgb;

        private GlProgram pCover;
        private GlProgram pBlur;
        private GlProgram pCompose;

        private int texA = -1;
        private int texB = -1;
        private int fboA = -1;
        private int fboB = -1;
        private int smallW;
        private int smallH;
        private float radiusTexels;

        private float[] bgScale = new float[] {1f, 1f};
        private float[] fgOrigin = new float[] {0f, 0f};
        private float[] fgSize = new float[] {1f, 1f};

        BlurPadShaderProgram(boolean useHdr, float targetAspect, int blurStrength, float[] bgRgb)
                throws VideoFrameProcessingException {
            super(useHdr, /* texturePoolCapacity= */ 1);
            this.targetAspect = targetAspect;
            this.strengthT = blurStrength / 100f;
            this.rgb = bgRgb != null ? bgRgb : new float[] {0f, 0f, 0f};
            this.bgMode = bgRgb != null ? 1f : 0f;
            try {
                pCover = new GlProgram(VERTEX_SHADER, FRAG_COVER);
                pBlur = new GlProgram(VERTEX_SHADER, FRAG_BLUR);
                pCompose = new GlProgram(VERTEX_SHADER, FRAG_COMPOSE);
                float[] quad = GlUtil.getNormalizedCoordinateBounds();
                int vecSize = GlUtil.HOMOGENEOUS_COORDINATE_VECTOR_SIZE;
                pCover.setBufferAttribute("aFramePosition", quad, vecSize);
                pBlur.setBufferAttribute("aFramePosition", quad, vecSize);
                pCompose.setBufferAttribute("aFramePosition", quad, vecSize);
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }

        @Override
        public Size configure(int inputWidth, int inputHeight) throws VideoFrameProcessingException {
            float inputAspect = (float) inputWidth / inputHeight;
            int outW;
            int outH;
            if (inputAspect > targetAspect) {
                outW = inputWidth;
                outH = Math.round(inputWidth / targetAspect);
            } else {
                outH = inputHeight;
                outW = Math.round(inputHeight * targetAspect);
            }
            float cap = 1920f / Math.max(outW, outH);
            if (cap < 1f) {
                outW = Math.round(outW * cap);
                outH = Math.round(outH * cap);
            }
            outW = outW & ~1;
            outH = outH & ~1;

            float outAspect = (float) outW / outH;
            if (inputAspect > outAspect) {
                float h = outAspect / inputAspect;
                fgOrigin = new float[] {0f, (1f - h) / 2f};
                fgSize = new float[] {1f, h};
            } else {
                float w = inputAspect / outAspect;
                fgOrigin = new float[] {(1f - w) / 2f, 0f};
                fgSize = new float[] {w, 1f};
            }
            bgScale = new float[] {
                    Math.min(1f, outAspect / inputAspect),
                    Math.min(1f, inputAspect / outAspect)
            };

            if (bgMode < 0.5f) {
                int div = 6 + Math.round(10f * strengthT);
                smallW = Math.max(2, (outW / div) & ~1);
                smallH = Math.max(2, (outH / div) & ~1);
                radiusTexels = 1.2f + 3.0f * strengthT;
                try {
                    deleteSmallTargets();
                    texA = GlUtil.createTexture(smallW, smallH, /* useHighPrecisionColorComponents= */ false);
                    fboA = GlUtil.createFboForTexture(texA);
                    texB = GlUtil.createTexture(smallW, smallH, /* useHighPrecisionColorComponents= */ false);
                    fboB = GlUtil.createFboForTexture(texB);
                } catch (GlUtil.GlException e) {
                    throw new VideoFrameProcessingException(e);
                }
            }
            return new Size(outW, outH);
        }

        @Override
        public void drawFrame(int inputTexId, long presentationTimeUs)
                throws VideoFrameProcessingException {
            try {
                if (bgMode < 0.5f) {
                    int[] prevFbo = new int[1];
                    GLES20.glGetIntegerv(GLES20.GL_FRAMEBUFFER_BINDING, prevFbo, 0);
                    int[] prevVp = new int[4];
                    GLES20.glGetIntegerv(GLES20.GL_VIEWPORT, prevVp, 0);

                    // pass 1: cover-mapped downsample -> A
                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboA);
                    GLES20.glViewport(0, 0, smallW, smallH);
                    pCover.use();
                    pCover.setSamplerTexIdUniform("uTex", inputTexId, 0);
                    pCover.setFloatsUniform("uBgScale", bgScale);
                    pCover.bindAttributesAndUniforms();
                    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);

                    // pass 2: horizontal blur A -> B
                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboB);
                    pBlur.use();
                    pBlur.setSamplerTexIdUniform("uTex", texA, 0);
                    pBlur.setFloatsUniform("uDir", new float[] {radiusTexels / smallW, 0f});
                    pBlur.bindAttributesAndUniforms();
                    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);

                    // pass 3: vertical blur B -> A
                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboA);
                    pBlur.use();
                    pBlur.setSamplerTexIdUniform("uTex", texB, 0);
                    pBlur.setFloatsUniform("uDir", new float[] {0f, radiusTexels / smallH});
                    pBlur.bindAttributesAndUniforms();
                    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);

                    // restore output framebuffer + viewport
                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, prevFbo[0]);
                    GLES20.glViewport(prevVp[0], prevVp[1], prevVp[2], prevVp[3]);
                }

                pCompose.use();
                pCompose.setSamplerTexIdUniform("uTex", inputTexId, 0);
                pCompose.setSamplerTexIdUniform("uBg", texA != -1 ? texA : inputTexId, 1);
                pCompose.setFloatsUniform("uFgOrigin", fgOrigin);
                pCompose.setFloatsUniform("uFgSize", fgSize);
                pCompose.setFloatUniform("uBgMode", bgMode);
                pCompose.setFloatsUniform("uBgColor", rgb);
                pCompose.bindAttributesAndUniforms();
                GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
                GlUtil.checkGlError();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e, presentationTimeUs);
            }
        }

        private void deleteSmallTargets() {
            if (fboA != -1) { GLES20.glDeleteFramebuffers(1, new int[] {fboA}, 0); fboA = -1; }
            if (fboB != -1) { GLES20.glDeleteFramebuffers(1, new int[] {fboB}, 0); fboB = -1; }
            if (texA != -1) { GLES20.glDeleteTextures(1, new int[] {texA}, 0); texA = -1; }
            if (texB != -1) { GLES20.glDeleteTextures(1, new int[] {texB}, 0); texB = -1; }
        }

        @Override
        public void release() throws VideoFrameProcessingException {
            super.release();
            try {
                deleteSmallTargets();
                if (pCover != null) pCover.delete();
                if (pBlur != null) pBlur.delete();
                if (pCompose != null) pCompose.delete();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }
    }
}
