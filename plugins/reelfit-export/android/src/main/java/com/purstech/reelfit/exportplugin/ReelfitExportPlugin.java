package com.purstech.reelfit.exportplugin;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;

import androidx.activity.result.ActivityResult;
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
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;

@UnstableApi
@CapacitorPlugin(name = "ReelfitExport")
public class ReelfitExportPlugin extends Plugin {

    private Transformer activeTransformer;
    private Handler progressHandler;
    private long exportStartMs;

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
        runExport(call, inputUri);
    }

    private void runExport(final PluginCall call, final Uri inputUri) {
        final float aspect = parseAspect(call.getString("aspect", "9:16"));
        final File outFile = new File(getContext().getCacheDir(),
                "reelfit_" + System.currentTimeMillis() + ".mp4");

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Presentation presentation = Presentation.createForAspectRatio(
                            aspect, Presentation.LAYOUT_SCALE_TO_FIT);
                    Effects effects = new Effects(
                            new ArrayList<AudioProcessor>(),
                            Collections.<androidx.media3.common.Effect>singletonList(presentation));
                    EditedMediaItem item = new EditedMediaItem.Builder(MediaItem.fromUri(inputUri))
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
            return "Movies/Reelfit/" + name;
        } catch (Exception e) {
            return null;
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
