package com.purstech.reelfit.exportplugin;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.opengl.GLES20;
import android.opengl.GLUtils;

import androidx.media3.common.VideoFrameProcessingException;
import androidx.media3.common.util.GlProgram;
import androidx.media3.common.util.GlUtil;
import androidx.media3.common.util.Size;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.BaseGlShaderProgram;
import androidx.media3.effect.GlEffect;
import androidx.media3.effect.GlShaderProgram;

/**
 * Reelfit pad effect v4. Fits the video inside a target aspect ratio and fills
 * the padding with either a smooth gaussian-blurred copy of the frame
 * (downsample -> separable H/V blur x2 -> upsample), a solid color, or a
 * cover-fitted image. Also draws an optional border and rounded corners on the
 * foreground via a rounded-rect SDF.
 */
@UnstableApi
public final class BlurPadEffect implements GlEffect {

    private final float targetAspect;
    private final float strengthT;
    private final float[] bgRgb;
    private final String bgImagePath;
    private final float borderFrac;
    private final float radiusFrac;
    private final float[] borderRgb;

    public BlurPadEffect(float targetAspect, int blurStrength, float[] bgRgb,
                         String bgImagePath, float borderFrac, float radiusFrac, float[] borderRgb) {
        this.targetAspect = targetAspect;
        this.strengthT = Math.max(0, Math.min(100, blurStrength)) / 100f;
        this.bgRgb = bgRgb;
        this.bgImagePath = bgImagePath;
        this.borderFrac = Math.max(0f, borderFrac);
        this.radiusFrac = Math.max(0f, radiusFrac);
        this.borderRgb = borderRgb != null ? borderRgb : new float[] { 1f, 1f, 1f };
    }

    @Override
    public GlShaderProgram toGlShaderProgram(Context context, boolean useHdr)
            throws VideoFrameProcessingException {
        return new Program(useHdr, this);
    }

    private static final class Program extends BaseGlShaderProgram {

        private static final String VS =
                "attribute vec4 aFramePosition;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  gl_Position = aFramePosition;\n"
              + "  vTexCoords = aFramePosition.xy * 0.5 + 0.5;\n"
              + "}\n";

        private static final String FS_COVER =
                "precision mediump float;\n"
              + "uniform sampler2D uTex;\n"
              + "uniform vec2 uCScale;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec2 s = (vTexCoords - 0.5) * uCScale + 0.5;\n"
              + "  gl_FragColor = vec4(texture2D(uTex, s).rgb, 1.0);\n"
              + "}\n";

        private static final String FS_BLUR =
                "precision mediump float;\n"
              + "uniform sampler2D uTex;\n"
              + "uniform vec2 uDir;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec3 c = texture2D(uTex, vTexCoords).rgb * 0.2270270270;\n"
              + "  c += texture2D(uTex, vTexCoords + uDir * 1.3846153846).rgb * 0.3162162162;\n"
              + "  c += texture2D(uTex, vTexCoords - uDir * 1.3846153846).rgb * 0.3162162162;\n"
              + "  c += texture2D(uTex, vTexCoords + uDir * 3.2307692308).rgb * 0.0702702703;\n"
              + "  c += texture2D(uTex, vTexCoords - uDir * 3.2307692308).rgb * 0.0702702703;\n"
              + "  gl_FragColor = vec4(c, 1.0);\n"
              + "}\n";

        private static final String FS_COMPOSE =
                "precision mediump float;\n"
              + "uniform sampler2D uTexSampler;\n"
              + "uniform sampler2D uBg;\n"
              + "uniform vec2 uFgOrigin;\n"
              + "uniform vec2 uFgSize;\n"
              + "uniform vec2 uOutSize;\n"
              + "uniform vec2 uBgScale;\n"
              + "uniform float uBgKind;\n"   // 0 blurred video, 1 solid color, 2 image
              + "uniform vec3 uBgColor;\n"
              + "uniform vec3 uBorderColor;\n"
              + "uniform float uBorderPx;\n"
              + "uniform float uRadiusPx;\n"
              + "varying vec2 vTexCoords;\n"
              + "void main() {\n"
              + "  vec2 uv = vTexCoords;\n"
              + "  vec2 f = (uv - uFgOrigin) / uFgSize;\n"
              + "  vec2 fgPx = uFgSize * uOutSize;\n"
              + "  vec2 p = (f - 0.5) * fgPx;\n"
              + "  vec2 halfE = 0.5 * fgPx;\n"
              + "  float r = min(uRadiusPx, min(halfE.x, halfE.y) - 1.0);\n"
              + "  r = max(r, 0.0);\n"
              + "  vec2 q = abs(p) - (halfE - vec2(r));\n"
              + "  float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - r;\n"
              + "  if (d < -uBorderPx) {\n"
              + "    gl_FragColor = vec4(texture2D(uTexSampler, f).rgb, 1.0);\n"
              + "  } else if (d < 0.0 && uBorderPx > 0.5) {\n"
              + "    gl_FragColor = vec4(uBorderColor, 1.0);\n"
              + "  } else if (d < 0.0) {\n"
              + "    gl_FragColor = vec4(texture2D(uTexSampler, f).rgb, 1.0);\n"
              + "  } else if (uBgKind > 1.5) {\n"
              + "    vec2 iuv = (uv - 0.5) * uBgScale + 0.5;\n"
              + "    gl_FragColor = vec4(texture2D(uBg, iuv).rgb, 1.0);\n"
              + "  } else if (uBgKind > 0.5) {\n"
              + "    gl_FragColor = vec4(uBgColor, 1.0);\n"
              + "  } else {\n"
              + "    vec3 c = texture2D(uBg, uv).rgb * 0.90;\n"
              + "    float n = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;\n"
              + "    gl_FragColor = vec4(c + n * 0.0078, 1.0);\n"
              + "  }\n"
              + "}\n";

        private final BlurPadEffect cfg;
        private GlProgram pCover;
        private GlProgram pBlur;
        private GlProgram pCompose;

        private int texA = -1;
        private int texB = -1;
        private int fboA = -1;
        private int fboB = -1;
        private int imgTex = -1;
        private int smallW;
        private int smallH;
        private int outWpx;
        private int outHpx;
        private float bgKind;
        private float[] fgOrigin = new float[] { 0f, 0f };
        private float[] fgSize = new float[] { 1f, 1f };
        private float[] coverScale = new float[] { 1f, 1f };
        private float[] imgScale = new float[] { 1f, 1f };
        private final int[] savedFbo = new int[1];
        private final int[] savedViewport = new int[4];

        Program(boolean useHdr, BlurPadEffect cfg) throws VideoFrameProcessingException {
            super(useHdr, /* texturePoolCapacity= */ 1);
            this.cfg = cfg;
            this.bgKind = cfg.bgImagePath != null ? 2f : (cfg.bgRgb != null ? 1f : 0f);
            try {
                pCover = new GlProgram(VS, FS_COVER);
                pBlur = new GlProgram(VS, FS_BLUR);
                pCompose = new GlProgram(VS, FS_COMPOSE);
                float[] quad = GlUtil.getNormalizedCoordinateBounds();
                int vs = GlUtil.HOMOGENEOUS_COORDINATE_VECTOR_SIZE;
                pCover.setBufferAttribute("aFramePosition", quad, vs);
                pBlur.setBufferAttribute("aFramePosition", quad, vs);
                pCompose.setBufferAttribute("aFramePosition", quad, vs);
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }

        @Override
        public Size configure(int inputWidth, int inputHeight) throws VideoFrameProcessingException {
            float inputAspect = (float) inputWidth / inputHeight;
            int outW;
            int outH;
            if (inputAspect > cfg.targetAspect) {
                outW = inputWidth;
                outH = Math.round(inputWidth / cfg.targetAspect);
            } else {
                outH = inputHeight;
                outW = Math.round(inputHeight * cfg.targetAspect);
            }
            float cap = 1920f / Math.max(outW, outH);
            if (cap < 1f) {
                outW = Math.round(outW * cap);
                outH = Math.round(outH * cap);
            }
            outW = outW & ~1;
            outH = outH & ~1;
            outWpx = outW;
            outHpx = outH;

            float outAspect = (float) outW / outH;
            if (inputAspect > outAspect) {
                float h = outAspect / inputAspect;
                fgOrigin = new float[] { 0f, (1f - h) / 2f };
                fgSize = new float[] { 1f, h };
            } else {
                float w = inputAspect / outAspect;
                fgOrigin = new float[] { (1f - w) / 2f, 0f };
                fgSize = new float[] { w, 1f };
            }
            coverScale = new float[] {
                    Math.min(1f, outAspect / inputAspect),
                    Math.min(1f, inputAspect / outAspect)
            };

            try {
                if (bgKind < 0.5f) {
                    // blurred-video pads: small ping-pong targets
                    deleteSmallTargets();
                    int div = 6 + Math.round(10f * cfg.strengthT);
                    smallW = Math.max(8, outW / div) & ~1;
                    smallH = Math.max(8, Math.round((float) smallW * outH / outW)) & ~1;
                    texA = GlUtil.createTexture(smallW, smallH, /* useHighPrecisionColorComponents= */ false);
                    fboA = GlUtil.createFboForTexture(texA);
                    texB = GlUtil.createTexture(smallW, smallH, /* useHighPrecisionColorComponents= */ false);
                    fboB = GlUtil.createFboForTexture(texB);
                } else if (bgKind > 1.5f && imgTex == -1 && cfg.bgImagePath != null) {
                    Bitmap bm = decodeScaled(cfg.bgImagePath, 1440);
                    if (bm != null) {
                        float imgAspect = (float) bm.getWidth() / bm.getHeight();
                        imgScale = new float[] {
                                Math.min(1f, outAspect / imgAspect),
                                Math.min(1f, imgAspect / outAspect)
                        };
                        int[] t = new int[1];
                        GLES20.glGenTextures(1, t, 0);
                        imgTex = t[0];
                        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, imgTex);
                        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
                        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
                        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
                        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
                        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bm, 0);
                        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
                        bm.recycle();
                    } else {
                        // decode failed: fall back to solid black pads
                        bgKind = 1f;
                    }
                }
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
            return new Size(outW, outH);
        }

        @Override
        public void drawFrame(int inputTexId, long presentationTimeUs)
                throws VideoFrameProcessingException {
            try {
                if (bgKind < 0.5f) {
                    GLES20.glGetIntegerv(GLES20.GL_FRAMEBUFFER_BINDING, savedFbo, 0);
                    GLES20.glGetIntegerv(GLES20.GL_VIEWPORT, savedViewport, 0);
                    GLES20.glViewport(0, 0, smallW, smallH);

                    // pass 1: cover-map the frame into the small target
                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboA);
                    pCover.use();
                    pCover.setSamplerTexIdUniform("uTex", inputTexId, 0);
                    pCover.setFloatsUniform("uCScale", coverScale);
                    pCover.bindAttributesAndUniforms();
                    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);

                    // passes 2-5: separable gaussian, two iterations
                    float rt = 1.2f + 3.0f * cfg.strengthT;
                    float[] dirH = new float[] { rt / smallW, 0f };
                    float[] dirV = new float[] { 0f, rt / smallH };
                    blurPass(fboB, texA, dirH);
                    blurPass(fboA, texB, dirV);
                    blurPass(fboB, texA, dirH);
                    blurPass(fboA, texB, dirV);

                    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, savedFbo[0]);
                    GLES20.glViewport(savedViewport[0], savedViewport[1], savedViewport[2], savedViewport[3]);
                }

                pCompose.use();
                pCompose.setSamplerTexIdUniform("uTexSampler", inputTexId, 0);
                int bgTex = bgKind > 1.5f ? imgTex : (bgKind < 0.5f ? texA : inputTexId);
                pCompose.setSamplerTexIdUniform("uBg", bgTex, 1);
                pCompose.setFloatsUniform("uFgOrigin", fgOrigin);
                pCompose.setFloatsUniform("uFgSize", fgSize);
                pCompose.setFloatsUniform("uOutSize", new float[] { outWpx, outHpx });
                pCompose.setFloatsUniform("uBgScale", bgKind > 1.5f ? imgScale : new float[] { 1f, 1f });
                pCompose.setFloatUniform("uBgKind", bgKind);
                pCompose.setFloatsUniform("uBgColor", cfg.bgRgb != null ? cfg.bgRgb : new float[] { 0f, 0f, 0f });
                pCompose.setFloatsUniform("uBorderColor", cfg.borderRgb);
                pCompose.setFloatUniform("uBorderPx", cfg.borderFrac * outWpx);
                pCompose.setFloatUniform("uRadiusPx", cfg.radiusFrac * outWpx);
                pCompose.bindAttributesAndUniforms();
                GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
                GlUtil.checkGlError();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e, presentationTimeUs);
            }
        }

        private void blurPass(int fbo, int srcTex, float[] dir) throws GlUtil.GlException {
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fbo);
            pBlur.use();
            pBlur.setSamplerTexIdUniform("uTex", srcTex, 0);
            pBlur.setFloatsUniform("uDir", dir);
            pBlur.bindAttributesAndUniforms();
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
        }

        private static Bitmap decodeScaled(String path, int maxEdge) {
            try {
                BitmapFactory.Options o = new BitmapFactory.Options();
                o.inJustDecodeBounds = true;
                BitmapFactory.decodeFile(path, o);
                int sample = 1;
                while (Math.max(o.outWidth, o.outHeight) / sample > maxEdge) sample *= 2;
                BitmapFactory.Options o2 = new BitmapFactory.Options();
                o2.inSampleSize = sample;
                o2.inPreferredConfig = Bitmap.Config.ARGB_8888;
                return BitmapFactory.decodeFile(path, o2);
            } catch (Exception e) {
                return null;
            }
        }

        private void deleteSmallTargets() {
            if (fboA != -1) { GLES20.glDeleteFramebuffers(1, new int[] { fboA }, 0); fboA = -1; }
            if (fboB != -1) { GLES20.glDeleteFramebuffers(1, new int[] { fboB }, 0); fboB = -1; }
            if (texA != -1) { GLES20.glDeleteTextures(1, new int[] { texA }, 0); texA = -1; }
            if (texB != -1) { GLES20.glDeleteTextures(1, new int[] { texB }, 0); texB = -1; }
        }

        @Override
        public void release() throws VideoFrameProcessingException {
            super.release();
            deleteSmallTargets();
            if (imgTex != -1) { GLES20.glDeleteTextures(1, new int[] { imgTex }, 0); imgTex = -1; }
            try {
                if (pCover != null) pCover.delete();
                if (pBlur != null) pBlur.delete();
                if (pCompose != null) pCompose.delete();
            } catch (GlUtil.GlException e) {
                throw new VideoFrameProcessingException(e);
            }
        }
    }
}
