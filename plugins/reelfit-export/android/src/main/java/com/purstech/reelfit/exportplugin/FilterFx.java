package com.purstech.reelfit.exportplugin;

import androidx.media3.common.Effect;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.Brightness;
import androidx.media3.effect.Contrast;
import androidx.media3.effect.HslAdjustment;
import androidx.media3.effect.RgbAdjustment;
import androidx.media3.effect.RgbFilter;

import java.util.ArrayList;
import java.util.List;

/** Maps Reelfit filter keys + Adjust panel values onto Media3 effect chains. */
@UnstableApi
final class FilterFx {

    private FilterFx() { }

    static List<Effect> chain(String key, int adjB, int adjC, int adjS) {
        List<Effect> fx = new ArrayList<Effect>();
        if (key == null) key = "none";
        if ("crisp".equals(key)) { con(fx, 0.12f); sat(fx, 8, 0); }
        else if ("warm".equals(key)) { tint(fx, 1.12f, 1.00f, 0.86f); sat(fx, 30, -10); }
        else if ("cool".equals(key)) { sat(fx, 20, 15); bri(fx, 0.03f); }
        else if ("bw".equals(key)) { fx.add(RgbFilter.createGrayscaleFilter()); con(fx, 0.10f); }
        else if ("vivid".equals(key)) { sat(fx, 65, 0); con(fx, 0.15f); }
        else if ("fade".equals(key)) { con(fx, -0.15f); bri(fx, 0.10f); sat(fx, -15, 0); }
        else if ("cinema".equals(key)) { con(fx, 0.25f); sat(fx, 15, -8); tint(fx, 1.05f, 1.00f, 0.93f); }
        else if ("film35".equals(key)) { tint(fx, 1.14f, 1.03f, 0.84f); con(fx, 0.25f); sat(fx, -15, 0); bri(fx, -0.07f); }
        else if ("noir".equals(key)) { fx.add(RgbFilter.createGrayscaleFilter()); con(fx, 0.45f); bri(fx, -0.10f); }
        else if ("gold".equals(key)) { tint(fx, 1.18f, 1.04f, 0.80f); sat(fx, 40, -18); bri(fx, 0.05f); }
        else if ("neon".equals(key)) { sat(fx, 90, 8); con(fx, 0.20f); bri(fx, 0.05f); }
        else if ("duo".equals(key)) { fx.add(RgbFilter.createGrayscaleFilter()); tint(fx, 0.55f, 0.48f, 1.30f); con(fx, 0.10f); }
        else if ("dream".equals(key)) { bri(fx, 0.12f); sat(fx, 15, 0); con(fx, -0.10f); }
        else if ("vhs".equals(key)) { sat(fx, 30, -5); con(fx, 0.15f); tint(fx, 1.07f, 1.00f, 0.90f); bri(fx, -0.03f); }
        else if ("matte".equals(key)) { con(fx, -0.10f); bri(fx, 0.06f); sat(fx, -10, 0); tint(fx, 1.03f, 1.00f, 0.96f); }
        // Adjust panel (neutral = 100)
        if (adjB != 100) bri(fx, clamp((adjB - 100) / 100f * 0.55f));
        if (adjC != 100) con(fx, clamp((adjC - 100) / 100f));
        if (adjS != 100) sat(fx, adjS - 100, 0);
        return fx;
    }

    private static void con(List<Effect> l, float v) { l.add(new Contrast(clamp(v))); }

    private static void bri(List<Effect> l, float v) { l.add(new Brightness(clamp(v))); }

    private static void sat(List<Effect> l, int satPct, int hueDeg) {
        HslAdjustment.Builder b = new HslAdjustment.Builder();
        if (satPct != 0) b.adjustSaturation(Math.max(-100, Math.min(100, satPct)));
        if (hueDeg != 0) b.adjustHue(hueDeg);
        l.add(b.build());
    }

    private static void tint(List<Effect> l, float r, float g, float b) {
        l.add(new RgbAdjustment.Builder().setRedScale(r).setGreenScale(g).setBlueScale(b).build());
    }

    private static float clamp(float v) { return Math.max(-1f, Math.min(1f, v)); }
}
