# Reelfit — Web UI Source & Build

This folder holds the **editable source** for Reelfit's entire web UI. This is the
"layered file" — edit `App.jsx`, rebuild, and the compiled `www/app.js` is regenerated.

Before this existed, only the compiled `www/app.js` (minified, unreadable) was in the
repo, and the editable source lived only in a temporary workspace that got wiped. This
file was recovered by decompiling the shipped **v0.7.7** bundle back into clean source,
then verified to behave identically (see "Verification" below).

---

## Source of truth

- **`src/App.jsx`** — the whole app: every screen, component, and the render entry point.
- **`www/app.js`** — the compiled bundle the app actually runs. **Generated from `App.jsx`.
  Never edit it by hand.**

The Java video engine (`plugins/reelfit-export/...`) is separate and unaffected.

---

## How to build

Requires Node. Dependencies (already in the repo's root `package.json`):
`react@^18`, `react-dom@^18`, `lucide-react@0.383.0`, plus `esbuild`.

From the repo root:

```bash
npm install
npx esbuild src/App.jsx \
  --bundle --minify --jsx=automatic --loader:.jsx=jsx \
  --target=es2018 --define:process.env.NODE_ENV='"production"' \
  --outfile=www/app.js
```

That single command reads `src/App.jsx` and writes `www/app.js`. Commit **both**.

The APK CI (`.github/workflows/build-apk.yml`) then builds the app from `www/app.js`
exactly as before — this change does **not** touch the CI.

---

## Workflow going forward

1. Edit `src/App.jsx` (add a feature, fix a bug).
2. Run the esbuild command above → regenerates `www/app.js`.
3. Commit both files (upload from a PC, not phone, to keep paths intact).
4. CI builds the APK.

---

## What the source looks like

Faithful to v0.7.7, so behavior is exact. Readability was restored where it matters most:

- **Clean imports** at the top: React hooks, `createRoot`, and the lucide icons actually used.
- **Real component names** — every screen/component is named, so you can jump straight to it:
  `App` (root + screen router), `Splash`, `Onboarding`, `CoachMarks`, `HomeScreen`,
  `Presets`, `Editor` (the big one — tools, background, speed, volume, text),
  `ExportSheet`, `Exporting`, `Success`, `Paywall`, `About`, `TopBar`, `BottomNav`,
  `Preview`, `ColorSheet`, `TextSheet`, `Slider`, `Pill`, `AspectGlyph`, `Wordmark`,
  `ByLine`, plus helpers `hsvToRgb`, `hexToHsv`, `filterAdjust`.
- **Real JSX** (`<div>…`), not compiled `jsx()` calls.

Still cosmetically compiled (harmless, will be cleaned as we touch each area):
- Local variables inside functions keep short names (`e`, `t`, `o`, …).
- A few module constants keep short names (`d` = colors, `L` = fonts, etc.).

None of that affects behavior or your ability to edit — component boundaries and all
UI text/styles are intact.

---

## Verification (why this is safe)

The reconstruction was proven equivalent to the original v0.7.7 bundle by driving both
through an identical automated UI test (jsdom): launch → Home → import video → pick
"Reels" → Editor → every tool (Format/Background/Adjust/Filters/Text/Frame/Trim/Audio/
Speed) → speed pills (0.25–2x) → volume (Mute/50/100%) → text sheet → export. Both the
original and the rebuild produce identical results (22/22) and the rebuilt bundle matches
the original's size (~306 KB) and rendered output.
