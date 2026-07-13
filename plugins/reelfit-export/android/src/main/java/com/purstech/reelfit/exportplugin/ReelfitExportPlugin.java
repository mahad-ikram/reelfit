package com.purstech.reelfit.exportplugin;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;

import androidx.activity.result.ActivityResult;
import androidx.media3.common.Effect;
import androidx.media3.common.MediaItem;
import androidx.media3.common.audio.AudioProcessor;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.effect.Presentation;
import androidx.media3.transformer.Composition;
import androidx.media3.transformer.EditedMediaItem;
import androidx.media3.transformer.Effects;
import androidx.media3.transformer.ExportException;
import androidx.media3.transformer.ExportResult;
import androidx.media3.transformer.ProgressHolder;
import androidx.media3.transformer.Transformer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@UnstableApi
@CapacitorPlugin(name = "ReelfitExport")
public class ReelfitExportPlugin extends Plugin {

    private Transformer activeTransformer;
    private Handler progressHandler;
    private long exportStartMs;
    private Uri lastSavedUri;

    @PluginMethod
    public void pickAndExport(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("video/*");
        startActivityForResult(call, intent, "onVideoPicked");
    }

    @ActivityCallback
    private void onVideoPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Cancelled");
            return;
        }
        Uri inputUri = result.getData().getData();
        float aspect = parseAspect(call.getString("aspect", "9:16"));
        String mode = call.getString("mode", "blur");
        int blurStrength = call.getInt("blur", 55);
        Effect geo;
        if ("letterbox".equals(mode)) {
            geo = Presentation.createForAspectRatio(aspect, Presentation.LAYOUT_SCALE_TO_FIT);
        } else {
            geo = new BlurPadEffect(aspect, blurStrength, null, null, 0f, 0f, null);
        }
        List<Effect> fx = new ArrayList<Effect>();
        fx.add(geo);
        runTransform(call, MediaItem.fromUri(inputUri), fx, new ArrayList<AudioProcessor>(), false);
    }

    // ---------- v2 API: pick() then export() ----------

    @PluginMethod
    public void pick(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("video/*");
        startActivityForResult(call, intent, "onVideoPickedOnly");
    }

    @ActivityCallback
    private void onVideoPickedOnly(final PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Cancelled");
            return;
        }
        final Uri uri = result.getData().getData();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    File dir = getContext().getCacheDir();
                    File[] old = dir.listFiles();
                    if (old != null) {
                        for (File f : old) {
                            if (f.getName().startsWith("reelfit_src_")) f.delete();
                        }
                    }
                    File dst = new File(dir, "reelfit_src_" + System.currentTimeMillis() + ".mp4");
                    InputStream in = getContext().getContentResolver().openInputStream(uri);
                    OutputStream out = new FileOutputStream(dst);
                    byte[] buf = new byte[65536];
                    int n;
                    long total = 0;
                    while ((n = in.read(buf)) > 0) { out.write(buf, 0, n); total += n; }
                    in.close();
                    out.close();

                    long durationMs = 0;
                    int w = 0, h = 0, rot = 0;
                    try {
                        MediaMetadataRetriever mr = new MediaMetadataRetriever();
                        mr.setDataSource(dst.getAbsolutePath());
                        String d = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
                        String ws = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH);
                        String hs = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT);
                        String rs = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION);
                        if (d != null) durationMs = Long.parseLong(d);
                        if (ws != null) w = Integer.parseInt(ws);
                        if (hs != null) h = Integer.parseInt(hs);
                        if (rs != null) rot = Integer.parseInt(rs);
                        mr.release();
                    } catch (Exception ignore) { }
                    if (rot == 90 || rot == 270) { int t = w; w = h; h = t; }

                    JSObject ret = new JSObject();
                    ret.put("path", dst.getAbsolutePath());
                    ret.put("durationMs", durationMs);
                    ret.put("width", w);
                    ret.put("height", h);
                    ret.put("sizeBytes", total);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Import failed: " + e.getMessage());
                }
            }
        }).start();
    }

    @PluginMethod
    public void export(PluginCall call) {
        String src = call.getString("src", null);
        if (src == null) { call.reject("Missing src"); return; }
        File f = new File(src);
        if (!f.exists()) { call.reject("Source file missing - re-import the video"); return; }

        float aspect = parseAspect(call.getString("aspect", "9:16"));
        String mode = call.getString("mode", "blur");
        int blurStrength = call.getInt("blur", 55);
        float[] bgRgb = parseHex(call.getString("bgColor", "#000000"));
        String filter = call.getString("filter", "none");
        int adjB = call.getInt("adjB", 100);
        int adjC = call.getInt("adjC", 100);
        int adjS = call.getInt("adjS", 100);
        Double spD = call.getDouble("speed");
        final double speed = spD != null ? spD.doubleValue() : 1.0;
        int volume = call.getInt("volume", 100);
        Double bfD = call.getDouble("borderFrac");
        float borderFrac = bfD != null ? bfD.floatValue() : 0f;
        Double rfD = call.getDouble("radiusFrac");
        float radiusFrac = rfD != null ? rfD.floatValue() : 0f;
        float[] borderRgb = parseHex(call.getString("borderColor", "#FFFFFF"));
        String bgImagePath = call.getString("bgImage", null);
        JSObject text = call.getObject("text", null);
        Double tS = call.getDouble("trimStartMs");
        Double tE = call.getDouble("trimEndMs");
        long trimStart = tS != null ? tS.longValue() : -1L;
        long trimEnd = tE != null ? tE.longValue() : -1L;

        MediaItem.Builder mb = new MediaItem.Builder().setUri(Uri.fromFile(f));
        if (trimStart >= 0 && trimEnd > trimStart) {
            mb.setClippingConfiguration(new MediaItem.ClippingConfiguration.Builder()
                    .setStartPositionMs(trimStart)
                    .setEndPositionMs(trimEnd)
                    .build());
        }

        List<Effect> fx = FilterFx.chain(filter, adjB, adjC, adjS);
        if (speed != 1.0) {
            fx.add(new SpeedChangeEffect((float) speed));
        }
        Effect geo;
        if ("fill".equals(mode)) {
            geo = Presentation.createForAspectRatio(aspect, Presentation.LAYOUT_SCALE_TO_FIT_WITH_CROP);
        } else if ("letterbox".equals(mode)) {
            geo = Presentation.createForAspectRatio(aspect, Presentation.LAYOUT_SCALE_TO_FIT);
        } else if ("image".equals(mode) && bgImagePath != null) {
            geo = new BlurPadEffect(aspect, blurStrength, null, bgImagePath, borderFrac, radiusFrac, borderRgb);
        } else if ("color".equals(mode)) {
            geo = new BlurPadEffect(aspect, blurStrength, bgRgb, null, borderFrac, radiusFrac, borderRgb);
        } else {
            geo = new BlurPadEffect(aspect, blurStrength, null, null, borderFrac, radiusFrac, borderRgb);
        }
        fx.add(geo);
        if (text != null) {
            String tv = text.optString("value", "");
            if (tv != null && tv.trim().length() > 0) {
                float[] tRgb = parseHex(text.optString("color", "#FFFFFF"));
                float sizeFrac = (float) text.optDouble("sizeFrac", 0.045);
                float posY = (float) text.optDouble("posY", -0.72);
                fx.add(TextFx.overlay(tv, tRgb, sizeFrac, posY));
            }
        }

        List<AudioProcessor> aud = new ArrayList<AudioProcessor>();
        boolean removeAudio = false;
        if (volume <= 0) {
            removeAudio = true;
        } else {
            if (speed != 1.0) {
                SonicAudioProcessor sonic = new SonicAudioProcessor();
                sonic.setSpeed((float) speed);
                aud.add(sonic);
            }
            if (volume != 100) {
                float v = Math.min(2f, volume / 100f);
                ChannelMixingAudioProcessor mix = new ChannelMixingAudioProcessor();
                mix.putChannelMixingMatrix(new ChannelMixingMatrix(1, 1, new float[] { v }));
                mix.putChannelMixingMatrix(new ChannelMixingMatrix(2, 2, new float[] { v, 0f, 0f, v }));
                aud.add(mix);
            }
        }
        runTransform(call, mb.build(), fx, aud, removeAudio);
    }

    private void runTransform(final PluginCall call, final MediaItem mediaItem, final List<Effect> videoFx, final List<AudioProcessor> audioFx, final boolean removeAudio) {
        final File outFile = new File(getContext().getCacheDir(),
                "reelfit_" + System.currentTimeMillis() + ".mp4");

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Effects effects = new Effects(
                            audioFx,
                            videoFx);
                    EditedMediaItem item = new EditedMediaItem.Builder(mediaItem)
                            .setRemoveAudio(removeAudio)
                            .setEffects(effects)
                            .build();

                    Transformer transformer = new Transformer.Builder(getContext())
                            .addListener(new Transformer.Listener() {
                                @Override
                                public void onCompleted(Composition composition, ExportResult exportResult) {
                                    stopProgress();
                                    String saved = saveToMovies(outFile);
                                    outFile.delete();
                                    if (saved == null) {
                                        call.reject("Export finished but saving to gallery failed");
                                        return;
                                    }
                                    JSObject ret = new JSObject();
                                    ret.put("saved", saved);
                                    ret.put("durationMs", System.currentTimeMillis() - exportStartMs);
                                    ret.put("uri", lastSavedUri != null ? lastSavedUri.toString() : "");
                                    call.resolve(ret);
                                }

                                @Override
                                public void onError(Composition composition, ExportResult exportResult,
                                                    ExportException exportException) {
                                    stopProgress();
                                    outFile.delete();
                                    call.reject("Export failed: " + exportException.getMessage());
                                }
                            })
                            .build();

                    activeTransformer = transformer;
                    exportStartMs = System.currentTimeMillis();
                    transformer.start(item, outFile.getAbsolutePath());
                    startProgress();
                } catch (Exception e) {
                    call.reject("Could not start export: " + e.getMessage());
                }
            }
        });
    }

    private void startProgress() {
        progressHandler = new Handler(Looper.getMainLooper());
        final ProgressHolder holder = new ProgressHolder();
        progressHandler.post(new Runnable() {
            @Override
            public void run() {
                if (activeTransformer == null) return;
                activeTransformer.getProgress(holder);
                JSObject data = new JSObject();
                data.put("progress", holder.progress);
                notifyListeners("exportProgress", data);
                progressHandler.postDelayed(this, 400);
            }
        });
    }

    private void stopProgress() {
        if (progressHandler != null) progressHandler.removeCallbacksAndMessages(null);
        activeTransformer = null;
    }

    @PluginMethod
    public void pickImage(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        startActivityForResult(call, intent, "onImagePicked");
    }

    @ActivityCallback
    private void onImagePicked(final PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Cancelled");
            return;
        }
        final Uri uri = result.getData().getData();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    File dir = getContext().getCacheDir();
                    File[] old = dir.listFiles();
                    if (old != null) {
                        for (File fo : old) {
                            if (fo.getName().startsWith("reelfit_bg_")) fo.delete();
                        }
                    }
                    File dst = new File(dir, "reelfit_bg_" + System.currentTimeMillis() + ".img");
                    InputStream in = getContext().getContentResolver().openInputStream(uri);
                    OutputStream out = new FileOutputStream(dst);
                    byte[] buf = new byte[65536];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                    in.close();
                    out.close();
                    JSObject ret = new JSObject();
                    ret.put("path", dst.getAbsolutePath());
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Image import failed: " + e.getMessage());
                }
            }
        }).start();
    }

    @PluginMethod
    public void shareVideo(PluginCall call) {
        String uriStr = call.getString("uri", null);
        if (uriStr == null || uriStr.length() == 0) { call.reject("Missing uri"); return; }
        try {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("video/mp4");
            send.putExtra(Intent.EXTRA_STREAM, Uri.parse(uriStr));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(send, "Share video"));
            call.resolve();
        } catch (Exception e) {
            call.reject("Share failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openVideo(PluginCall call) {
        String uriStr = call.getString("uri", null);
        if (uriStr == null || uriStr.length() == 0) { call.reject("Missing uri"); return; }
        try {
            Intent view = new Intent(Intent.ACTION_VIEW);
            view.setDataAndType(Uri.parse(uriStr), "video/mp4");
            view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(view);
            call.resolve();
        } catch (Exception e) {
            call.reject("Open failed: " + e.getMessage());
        }
    }

    private String saveToMovies(File src) {
        try {
            String name = "Reelfit_" + System.currentTimeMillis() + ".mp4";
            ContentValues values = new ContentValues();
            values.put(MediaStore.Video.Media.DISPLAY_NAME, name);
            values.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
            if (Build.VERSION.SDK_INT >= 29) {
                values.put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/Reelfit");
            }
            Uri dest = getContext().getContentResolver()
                    .insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
            if (dest == null) return null;
            InputStream in = new FileInputStream(src);
            OutputStream out = getContext().getContentResolver().openOutputStream(dest);
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            out.close();
            lastSavedUri = dest;
            return "Movies/Reelfit/" + name;
        } catch (Exception e) {
            return null;
        }
    }

    private float[] parseHex(String hex) {
        try {
            String h = hex.replace("#", "");
            int r = Integer.parseInt(h.substring(0, 2), 16);
            int g = Integer.parseInt(h.substring(2, 4), 16);
            int b = Integer.parseInt(h.substring(4, 6), 16);
            return new float[] { r / 255f, g / 255f, b / 255f };
        } catch (Exception e) {
            return new float[] { 0f, 0f, 0f };
        }
    }

    private float parseAspect(String s) {
        try {
            String[] parts = s.split(":");
            return Float.parseFloat(parts[0]) / Float.parseFloat(parts[1]);
        } catch (Exception e) {
            return 9f / 16f;
        }
    }
}
