package com.purstech.reelfit.exportplugin;

import android.graphics.Color;
import android.graphics.Typeface;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.text.style.RelativeSizeSpan;
import android.text.style.StyleSpan;

import androidx.media3.common.Effect;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.OverlayEffect;
import androidx.media3.effect.OverlaySettings;
import androidx.media3.effect.TextOverlay;
import androidx.media3.effect.TextureOverlay;

import com.google.common.collect.ImmutableList;

/** Burns a static text overlay onto the export. */
@UnstableApi
final class TextFx {

    private TextFx() { }

    static Effect overlay(String value, float[] rgb, float sizeFrac, float posY) {
        SpannableString sp = new SpannableString(value);
        int color = Color.rgb(
                Math.round(rgb[0] * 255f),
                Math.round(rgb[1] * 255f),
                Math.round(rgb[2] * 255f));
        sp.setSpan(new ForegroundColorSpan(color), 0, sp.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sp.setSpan(new StyleSpan(Typeface.BOLD), 0, sp.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sp.setSpan(new RelativeSizeSpan(Math.max(0.5f, sizeFrac * 20f)), 0, sp.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        OverlaySettings settings = new OverlaySettings.Builder()
                .setBackgroundFrameAnchor(0f, posY)
                .setOverlayFrameAnchor(0f, 0f)
                .build();
        TextureOverlay overlay = TextOverlay.createStaticTextOverlay(sp, settings);
        return new OverlayEffect(ImmutableList.<TextureOverlay>of(overlay));
    }
}
