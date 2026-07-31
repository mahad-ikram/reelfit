# Reelfit Music Library — hosting & licensing setup

The app is ready. It fetches a JSON manifest, lists the tracks, and downloads one
**only when the user taps it**. Nothing ships inside the APK.

You need to do two things: **pick tracks you're allowed to redistribute**, and
**host them**.

---

## 1. Licensing — the part that can get the app pulled

The app hands users a track and they use it essentially unchanged in their video.
Legally that is **redistribution of the raw file**, and most "free" music sites
forbid exactly that.

### Use CC0 only (for now)

**CC0 / public domain** is the only licence with no conditions attached: no
attribution, no restrictions on redistribution, and the rights holder cannot
revoke it later. That makes it the only category that is safe without building
attribution plumbing.

### Do NOT use these

| Source | Why not |
|---|---|
| **Pixabay** | Licence forbids distributing content on a "Standalone" basis — where no creative effort has been applied and it stays substantially unchanged. An in-app track picker is precisely that. |
| **Mixkit / Uppbeat / Bensound (free tiers)** | Same pattern — free to *use in your video*, not to *redistribute from your app*. |
| **Jamendo free tier** | Personal use; commercial app use needs their paid licensing. |
| **YouTube Audio Library** | Licensed for use on YouTube, not for redistribution elsewhere. |

### Candidate CC0 sources to check

- **Free Music Archive**, filtered to **CC0 only** — has a documented licence guide and a real filter.
- **Internet Archive**, Open Source Audio — large, but licensing per item is inconsistent, so verify each track.
- **Musopen** — public-domain classical recordings. Limited genre range for short-form video.
- **FreePD** (Kevin MacLeod's CC0 collection) — **status unclear.** Wikimedia Commons lists the site as discontinued since 2025, while other sources still describe it as live. Verify before relying on it. Mirrors of the collection exist on GitHub.

### Before you ship, for every single track

1. Save a screenshot or PDF of the licence page showing **CC0** for that specific track.
2. Record artist, title, source URL and date downloaded in a spreadsheet.
3. Keep that file. If a claim ever arrives, it is the only thing that resolves it.

CC-BY tracks are usable too, but each one obliges you to display a credit. If you
want those later, tell me and I'll add an attribution screen — don't mix them in
without it.

**I'm not a lawyer and this isn't legal advice.** For anything you're unsure
about, especially at scale, get a professional to review your track list.

---

## 2. Hosting — Cloudflare R2

R2's free tier suits this well: 10 GB storage and, importantly, **zero egress
fees**. Egress is what makes S3 expensive once an app gets popular — you pay per
download. R2 doesn't charge for it, so the cost of the library stays flat as you
grow.

### Steps

1. Create a Cloudflare account → **R2** → create a bucket, e.g. `reelfit-music`.
2. Upload your MP3s. Keep them modest: **128 kbps mono or stereo, 2–4 MB per track**.
3. Enable **public access** on the bucket (or attach a custom domain).
4. Upload `manifest.json` (schema below) to the bucket root.
5. In `src/App.jsx`, set the manifest URL — it's a single named constant:

```js
MUSIC_MANIFEST = "https://<your-r2-domain>/manifest.json",
```

6. Rebuild `www/app.js` and commit.

### manifest.json

```json
{
  "version": 1,
  "tracks": [
    {
      "id": "calm-sunrise",
      "title": "Calm Sunrise",
      "artist": "Kevin MacLeod",
      "mood": "Calm",
      "durationMs": 143000,
      "licence": "CC0",
      "url": "https://<your-r2-domain>/calm-sunrise.mp3"
    }
  ]
}
```

`id` must be unique and stable — it's the cache key. `mood`, `artist` and
`durationMs` are optional but improve the list. `licence` is displayed to the
user, which is good practice and reassures them the track is safe to post.

---

## 3. How caching works

- Tapping a track downloads it to the app cache as `reelfit_lib_<id>.mp3`.
- **Already-downloaded tracks are reused instantly** — no second download, no data cost.
- Only the **3 most recent** library tracks are kept; the oldest is deleted automatically.

This is a deliberate change from "delete after every use". Re-downloading the same
track each time would burn users' mobile data for no benefit — a real cost for
users on metered connections. Three tracks is roughly 10 MB, so the app stays
light while repeat use stays free.

---

## 4. If the manifest isn't reachable

The library sheet shows *"Library isn't available yet"* and points the user to
**My files**. No error, no crash — so you can ship this build before the bucket
exists and the library simply switches on once the manifest goes live.
