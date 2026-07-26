# Reelfit — Web UI Source & Build

This folder holds the **editable source** for Reelfit's entire web UI. This is the
"layered file" — edit `App.jsx`, rebuild, and the compiled `www/app.js` is regenerated.

Before this existed, only the compiled `www/app.js` (minified, unreadable) was in the
repo, and the editable source lived only in a temporary workspace that got wiped. This
file was recovered by decompiling the shipped **v0.7.7** bundle back into clean source,
then verified to render identically (see "Verification").

---

## Source of truth

- **`src/App.jsx`** — the whole app: every screen, component, and the render entry point.
- **`www/app.js`** — the compiled bundle the app actually runs. **Generated from `App.jsx`.
  Never edit it by hand.**

The Java video engine (`plugins/reelfit-export/...`) is separate and unaffected.

---

## How to build

Requires Node. Dependencies: `react@^18`, `react-dom@^18`, `lucide-react@0.383.0`, `esbuild`.

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
exactly as before — this does **not** change CI.

---

## Workflow going forward

1. Edit `src/App.jsx`.
2. Run the esbuild command above → regenerates `www/app.js`.
3. Commit both files (upload from a PC, not phone, to keep folder paths intact).
4. CI builds the APK.

---

## What the source looks like

Faithful to v0.7.7, so behavior is exact. Readability restored where it matters:

- **Clean imports** at the top: React hooks, `createRoot`, and the lucide icons used.
- **Real component names** — jump straight to any screen: `App` (root + screen router),
  `Splash`, `Onboarding`, `CoachMarks`, `HomeScreen`, `Presets`, `Editor` (the big one —
  tools, background, speed, volume, text), `ExportSheet`, `Exporting`, `Success`,
  `Paywall`, `About`, `TopBar`, `BottomNav`, `Preview`, `ColorSheet`, `TextSheet`,
  `Slider`, `Pill`, `AspectGlyph`, `Wordmark`, `ByLine`, plus helpers `hsvToRgb`,
  `hexToHsv`, `filterAdjust`.
- **Real JSX** (`<div>…`), not compiled `jsx()` calls.

Still cosmetically compiled (harmless, cleaned up as we touch each area):
- Local variables inside functions keep short names (`e`, `t`, `o`, …).
- A few module constants keep short names (`d` = colors, `L` = fonts, `ug` = palette,
  `Ol` = text styles, `ps`/`Ic` = embedded logo images).

---

## ⚠️ The one rule that will bite you: component names must be Capitalized

JSX treats a **lowercase** tag as a plain HTML element and a **Capitalized** tag as a
component. So:

```jsx
<Icon size={18} />   // ✅ renders the component
<icon size={18} />   // ❌ renders a literal <icon> HTML tag — invisible, no error
```

This is silent: no crash, no console warning, the element just renders empty. It bit this
recovery twice — once making the whole app blank (`<ms/>`), once making all the toolbar
and About icons disappear while everything else looked fine (an icon destructured into a
lowercase variable, `{I: a}` → `<a/>`, which rendered as an HTML anchor).

**If you ever store a component in a variable, capitalize it:**

```jsx
{items.map(({ I: Icon, l: label }) => <Icon size={18} />)}   // ✅
```

---

## Verification (why this is safe)

The reconstruction was proven equivalent to the original v0.7.7 bundle by rendering both
in a headless browser and diffing the resulting DOM across 24 screen states: Home, Editor,
every tool tab (Format/Background/Adjust/Filters/Text/Trim/Audio/Speed), every background
(Blur/Color/Glow/Black/White/Image), every speed pill (0.5x/1x/2x), every volume preset
(Mute/50%/100%), the export sheet, About, and Pro.

Each state is compared on four things: element count, tag structure, visible text, and
**SVG path geometry** (so a missing or wrong icon is caught, not just a missing element).

Result: **24/24 identical**, plus a 22/22 interaction pass and a matching bundle size
(~306 KB). Re-run these before shipping any change:

- `node domdiff.js <original> <rebuilt>` — structural DOM diff
- `node harness.js <bundle>` — interaction/crash audit
