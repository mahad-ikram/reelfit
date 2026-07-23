import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ChevronLeft, ChevronRight, Crown, Download, Gauge, Globe, Home, Image, Info, Instagram, Layers, Lock, Maximize2, Music, Palette, Play, Plus, RotateCcw, Scissors, Share2, SlidersHorizontal, Sparkles, Square, Type, Upload, Volume2, WandSparkles, X, Youtube } from "lucide-react";

var d = {
    volt: "#6C3AFF",
    voltSoft: "#8A63FF",
    voltDim: "rgba(108,58,255,0.15)",
    eclipse: "#0A0A14",
    eclipse2: "#12121F",
    card: "#191926",
    cardHi: "#20202F",
    bone: "#F5F2EC",
    line: "rgba(255,255,255,0.08)",
    line2: "rgba(255,255,255,0.14)",
    muted: "#8B8798",
    mutedHi: "#A9A5B6"
  },
  L = {
    sans: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
    serif: "'Fraunces', Georgia, serif",
    mono: "'JetBrains Mono', ui-monospace, monospace"
  },
  is = {
    "9:16": [9, 16],
    "16:9": [16, 9],
    "4:5": [4, 5],
    "1:1": [1, 1],
    "3:4": [3, 4]
  },
  _e = "radial-gradient(120% 90% at 20% 10%, #FF7A59 0%, rgba(255,122,89,0) 45%),radial-gradient(120% 120% at 90% 30%, #6C3AFF 0%, rgba(108,58,255,0) 50%),linear-gradient(135deg, #12203A 0%, #2B1D4E 55%, #3A1230 100%)",
  lg = ["#6C3AFF", "#0E0E16", "#F5F2EC", "#FF6B6B", "#FF9F45", "#FFD23F", "#3DDC97", "#22C3D6", "#4C6EF5", "#FF5CA8"],
  dc = ["linear-gradient(135deg,#F6D365,#FDA085)", "linear-gradient(135deg,#84FAB0,#8FD3F4)", "linear-gradient(135deg,#A18CD1,#FBC2EB)", "repeating-linear-gradient(45deg,#16162a,#16162a 9px,#20203a 9px,#20203a 18px)"],
  Wt = {
    Clean: {
      color: "#FFFFFF",
      weight: 800,
      shadow: "0 2px 8px rgba(0,0,0,0.6)",
      posY: -0.72
    },
    Bold: {
      color: "#FFFFFF",
      weight: 900,
      shadow: "0 3px 0 rgba(0,0,0,0.85)",
      posY: 0
    },
    Neon: {
      color: "#25F4EE",
      weight: 800,
      shadow: "0 0 12px rgba(37,244,238,0.9)",
      posY: 0
    },
    Caption: {
      color: "#FFFFFF",
      weight: 700,
      bgBox: "rgba(0,0,0,0.55)",
      posY: -0.78
    },
    Meme: {
      color: "#FFFFFF",
      weight: 900,
      shadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
      posY: 0.8
    }
  };
function hsvToRgb(e, t, a) {
  let o = a * t,
    r = o * (1 - Math.abs(e / 60 % 2 - 1)),
    l = a - o,
    n = 0,
    s = 0,
    i = 0;
  e < 60 ? (n = o, s = r) : e < 120 ? (n = r, s = o) : e < 180 ? (s = o, i = r) : e < 240 ? (s = r, i = o) : e < 300 ? (n = r, i = o) : (n = o, i = r);
  let f = g => Math.round((g + l) * 255).toString(16).padStart(2, "0");
  return ("#" + f(n) + f(s) + f(i)).toUpperCase();
}
function hexToHsv(e) {
  let t = (e || "").replace("#", "");
  if (t.length === 3 && (t = t.split("").map(f => f + f).join("")), t.length !== 6) return {
    h: 265,
    s: 0.77,
    v: 1
  };
  let a = parseInt(t.slice(0, 2), 16) / 255,
    o = parseInt(t.slice(2, 4), 16) / 255,
    r = parseInt(t.slice(4, 6), 16) / 255,
    l = Math.max(a, o, r),
    n = Math.min(a, o, r),
    s = l - n,
    i = 0;
  return s !== 0 && (l === a ? i = (o - r) / s % 6 : l === o ? i = (r - a) / s + 2 : i = (a - o) / s + 4, i *= 60, i < 0 && (i += 360)), {
    h: i,
    s: l === 0 ? 0 : s / l,
    v: l
  };
}
var ug = ["#6C3AFF", "#0E0E16", "#F5F2EC", "#FF6B6B", "#FF9F45", "#FFD23F", "#3DDC97", "#22C3D6", "#4C6EF5", "#B15CFF", "#FF5CA8", "#8B93A7"],
  pc = {
    position: "absolute",
    inset: 0,
    background: "rgba(5,5,12,0.80)",
    display: "flex",
    alignItems: "flex-end",
    zIndex: 60
  },
  mc = {
    width: "100%",
    background: "#12121D",
    borderRadius: "24px 24px 0 0",
    padding: "14px 18px 26px",
    borderTop: "1px solid rgba(139,135,152,0.22)",
    boxShadow: "0 -14px 44px rgba(0,0,0,0.55)"
  },
  gc = {
    width: 40,
    height: 4,
    borderRadius: 999,
    background: "rgba(139,135,152,0.4)",
    margin: "0 auto 16px"
  },
  ss = {
    flex: 1,
    background: "none",
    border: "1px solid rgba(139,135,152,0.35)",
    borderRadius: 13,
    padding: 13,
    fontFamily: L.sans,
    fontWeight: 700,
    fontSize: 13.5,
    color: d.bone,
    cursor: "pointer"
  },
  hc = {
    flex: 1,
    background: "linear-gradient(135deg,#6C3AFF,#4A24C4)",
    border: "none",
    borderRadius: 13,
    padding: 13,
    fontFamily: L.sans,
    fontWeight: 800,
    fontSize: 13.5,
    color: "#fff",
    cursor: "pointer"
  };
function ColorSheet({
  initial: e,
  onCancel: t,
  onSet: a
}) {
  let o = hexToHsv(e || "#6C3AFF"),
    [r, l] = useState(o.h),
    [n, s] = useState(o.s),
    [i, f] = useState(o.v),
    g = hsvToRgb(r, n, i),
    h = useRef(null),
    x = useRef(null),
    I = useRef(!1),
    S = useRef(!1),
    A = (p, c) => {
      let m = h.current.getBoundingClientRect();
      s(Math.max(0, Math.min(1, (p - m.left) / m.width))), f(Math.max(0, Math.min(1, 1 - (c - m.top) / m.height)));
    },
    M = p => {
      let c = x.current.getBoundingClientRect();
      l(Math.max(0, Math.min(1, (p - c.left) / c.width)) * 360);
    };
  return <div style={pc} onClick={t}><div onClick={p => p.stopPropagation()} style={mc}><div style={gc} /><div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15
      }}><div style={{
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 16,
          color: d.bone
        }}>{"Background colour"}</div><div style={{
          display: "flex",
          alignItems: "center",
          gap: 8
        }}><div style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: g,
            border: "1px solid " + d.line2
          }} /><span style={{
            fontFamily: L.mono,
            fontSize: 12,
            color: d.mutedHi
          }}>{g}</span></div></div><div ref={h} onPointerDown={p => {
        I.current = !0, p.currentTarget.setPointerCapture(p.pointerId), A(p.clientX, p.clientY);
      }} onPointerMove={p => {
        I.current && A(p.clientX, p.clientY);
      }} onPointerUp={() => {
        I.current = !1;
      }} style={{
        position: "relative",
        width: "100%",
        height: 150,
        borderRadius: 14,
        cursor: "crosshair",
        touchAction: "none",
        background: "linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,hsl(" + r + ",100%,50%))",
        border: "1px solid " + d.line2,
        marginBottom: 16
      }}><div style={{
          position: "absolute",
          left: n * 100 + "%",
          top: (1 - i) * 100 + "%",
          width: 18,
          height: 18,
          borderRadius: 999,
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
          transform: "translate(-50%,-50%)",
          background: g,
          pointerEvents: "none"
        }} /></div><div ref={x} onPointerDown={p => {
        S.current = !0, p.currentTarget.setPointerCapture(p.pointerId), M(p.clientX);
      }} onPointerMove={p => {
        S.current && M(p.clientX);
      }} onPointerUp={() => {
        S.current = !1;
      }} style={{
        position: "relative",
        width: "100%",
        height: 16,
        borderRadius: 999,
        cursor: "pointer",
        touchAction: "none",
        background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
        marginBottom: 16
      }}><div style={{
          position: "absolute",
          left: r / 360 * 100 + "%",
          top: "50%",
          width: 20,
          height: 20,
          borderRadius: 999,
          border: "2.5px solid #fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
          transform: "translate(-50%,-50%)",
          background: "hsl(" + r + ",100%,50%)",
          pointerEvents: "none"
        }} /></div><div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 18
      }}>{ug.map(p => <button onClick={() => {
          let c = hexToHsv(p);
          l(c.h), s(c.s), f(c.v);
        }} style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: p,
          cursor: "pointer",
          border: g.toUpperCase() === p.toUpperCase() ? "2px solid " + d.volt : "1px solid " + d.line2
        }} key={p} />)}</div><div style={{
        display: "flex",
        gap: 10
      }}><button onClick={t} style={ss}>{"Cancel"}</button><button onClick={() => a(g)} style={hc}>{"Set colour"}</button></div></div></div>;
}
function TextSheet({
  initialValue: e,
  initialStyle: t,
  onCancel: a,
  onDone: o,
  onRemove: r
}) {
  let [l, n] = useState(e && e !== "YOUR TEXT" ? e : ""),
    [s, i] = useState(t || "Clean"),
    f = Wt[s] || Wt.Clean,
    g = f.posY >= 0.5 ? "flex-end" : f.posY <= -0.5 ? "flex-start" : "center";
  return <div style={pc} onClick={a}><div onClick={h => h.stopPropagation()} style={mc}><div style={gc} /><div style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 16,
        color: d.bone,
        marginBottom: 14
      }}>{"Add text"}</div><div style={{
        height: 96,
        borderRadius: 14,
        background: "linear-gradient(135deg,#1A1522,#0E0E16)",
        border: "1px solid " + d.line2,
        display: "flex",
        justifyContent: "center",
        alignItems: g,
        padding: "12px 14px",
        marginBottom: 14,
        overflow: "hidden"
      }}><span style={{
          fontFamily: L.sans,
          fontWeight: f.weight,
          fontSize: 20,
          color: l ? f.color : d.muted,
          textShadow: f.shadow || "none",
          textAlign: "center",
          wordBreak: "break-word",
          ...(f.bgBox ? {
            background: f.bgBox,
            padding: "3px 10px",
            borderRadius: 6
          } : {})
        }}>{l || "Your text"}</span></div><input autoFocus={!0} value={l} onChange={h => n(h.target.value)} maxLength={60} placeholder="Type your caption..." onFocus={h => h.target.style.borderColor = d.volt} onBlur={h => h.target.style.borderColor = d.line2} style={{
        width: "100%",
        boxSizing: "border-box",
        background: "#0C0C14",
        border: "1.5px solid " + d.line2,
        borderRadius: 12,
        padding: "13px 14px",
        fontFamily: L.sans,
        fontWeight: 600,
        fontSize: 15,
        color: d.bone,
        outline: "none",
        marginBottom: 5
      }} /><div style={{
        textAlign: "right",
        fontFamily: L.mono,
        fontSize: 10,
        color: d.muted,
        marginBottom: 14
      }}>{l.length}{"/60"}</div><div style={{
        fontFamily: L.sans,
        fontSize: 11,
        fontWeight: 600,
        color: d.mutedHi,
        marginBottom: 8
      }}>{"Style"}</div><div style={{
        display: "flex",
        gap: 7,
        overflowX: "auto",
        marginBottom: 18,
        paddingBottom: 2
      }}>{["Clean", "Bold", "Neon", "Caption", "Meme"].map(h => <Pill small={!0} active={s === h} onClick={() => i(h)} key={h}>{h}</Pill>)}</div><div style={{
        display: "flex",
        gap: 10
      }}>{r && <button onClick={r} style={{
          ...ss,
          flex: "0 0 auto",
          padding: "13px 16px",
          color: "#FF7A7A",
          borderColor: "rgba(255,122,122,0.4)"
        }}>{"Remove"}</button>}<button onClick={a} style={ss}>{"Cancel"}</button><button onClick={() => {
          l.trim() && o(l.trim(), s);
        }} style={{
          ...hc,
          opacity: l.trim() ? 1 : 0.5
        }}>{"Add to video"}</button></div></div></div>;
}
var Ol = [{
  k: "none",
  l: "None",
  css: ""
}, {
  k: "crisp",
  l: "Crisp",
  css: "contrast(1.12) saturate(1.08)"
}, {
  k: "warm",
  l: "Warm",
  css: "sepia(.3) saturate(1.3) hue-rotate(-10deg)"
}, {
  k: "cool",
  l: "Cool",
  css: "saturate(1.2) hue-rotate(15deg) brightness(1.03)"
}, {
  k: "bw",
  l: "B&W",
  css: "grayscale(1) contrast(1.1)"
}, {
  k: "vivid",
  l: "Vivid",
  css: "saturate(1.65) contrast(1.15)"
}, {
  k: "fade",
  l: "Fade",
  css: "contrast(.85) brightness(1.1) saturate(.85)"
}, {
  k: "cinema",
  l: "Cinema",
  css: "contrast(1.25) saturate(1.15) hue-rotate(-8deg) sepia(.15)",
  pro: !0
}, {
  k: "film35",
  l: "Film 35",
  css: "sepia(.4) contrast(1.25) saturate(.85) brightness(.93)",
  pro: !0
}, {
  k: "noir",
  l: "Noir",
  css: "grayscale(1) contrast(1.45) brightness(.9)",
  pro: !0
}, {
  k: "gold",
  l: "Gold Hour",
  css: "sepia(.5) saturate(1.4) hue-rotate(-18deg) brightness(1.05)",
  pro: !0
}, {
  k: "neon",
  l: "Neon",
  css: "saturate(1.9) contrast(1.2) hue-rotate(8deg) brightness(1.05)",
  pro: !0
}, {
  k: "duo",
  l: "Duotone",
  css: "grayscale(1) sepia(1) hue-rotate(220deg) saturate(2.4) contrast(1.1)",
  pro: !0
}, {
  k: "dream",
  l: "Dream",
  css: "brightness(1.12) saturate(1.15) contrast(.9)",
  pro: !0
}, {
  k: "vhs",
  l: "VHS",
  css: "saturate(1.3) contrast(1.15) hue-rotate(-5deg) sepia(.2) brightness(.97)",
  pro: !0
}, {
  k: "matte",
  l: "Matte",
  css: "contrast(.9) brightness(1.06) saturate(.9) sepia(.08)",
  pro: !0
}];
function filterAdjust(e, t, a) {
  let [o, r] = is[e],
    l = t,
    n = l * r / o;
  return n > a && (n = a, l = n * o / r), {
    w: Math.round(l),
    h: Math.round(n)
  };
}
function Wordmark({
  size: e = 22
}) {
  return <span style={{
    fontFamily: L.sans,
    fontWeight: 800,
    fontSize: e,
    letterSpacing: "-0.02em",
    color: d.bone
  }}>{"Reel"}<span style={{
      color: d.volt
    }}>{"fit"}</span></span>;
}
function ByLine({
  dim: e
}) {
  return <div style={{
    fontFamily: L.mono,
    fontSize: 9,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: e ? "rgba(245,242,236,0.4)" : d.muted
  }}>{"by PursTech"}</div>;
}
function Pill({
  children: e,
  active: t,
  onClick: a,
  small: o
}) {
  return <button onClick={a} style={{
    fontFamily: L.sans,
    fontWeight: 700,
    fontSize: o ? 11 : 12,
    padding: o ? "6px 11px" : "7px 13px",
    borderRadius: 999,
    border: `1px solid ${t ? d.volt : d.line2}`,
    cursor: "pointer",
    background: t ? d.volt : "transparent",
    color: t ? "#fff" : d.mutedHi,
    whiteSpace: "nowrap"
  }}>{e}</button>;
}
function Slider({
  value: e,
  min: t,
  max: a,
  onChange: o,
  label: r,
  valLabel: l
}) {
  return <div style={{
    marginBottom: 12
  }}><div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 5
    }}><span style={{
        fontFamily: L.sans,
        fontSize: 11,
        fontWeight: 700,
        color: d.mutedHi
      }}>{r}</span><span style={{
        fontFamily: L.mono,
        fontSize: 10,
        color: d.volt
      }}>{l}</span></div><input type="range" min={t} max={a} value={e} onChange={n => o(Number(n.target.value))} style={{
      width: "100%",
      accentColor: d.volt,
      height: 4
    }} /></div>;
}
function AspectGlyph({
  r: e,
  color: t = d.mutedHi
}) {
  let [a, o] = is[e],
    r = 18,
    l = r,
    n = r;
  return a > o ? n = r * o / a : l = r * a / o, <div style={{
    width: l,
    height: n,
    border: `1.6px solid ${t}`,
    borderRadius: 3
  }} />;
}
function Preview({
  ratio: e,
  bgType: t,
  bgColor: a,
  bgImage: o,
  blurAmt: r,
  fill: l,
  scale: n,
  adj: s,
  filterCss: i,
  border: f,
  radius: g,
  borderColor: h,
  showText: x,
  textValue: I,
  textStyle: S,
  textPos: A,
  onTextMove: M,
  textScale: p,
  trim: c,
  speed: m,
  vol: y,
  onThumb: F,
  media: w,
  maxW: B = 244,
  maxH: T = 300
}) {
  let {
      w: q,
      h: E
    } = filterAdjust(e, B, T),
    oe = w && w.width > 0 && w.height > 0 ? w.width / w.height : 16 / 9,
    K,
    Te;
  l ? q / E > oe ? (K = q, Te = q / oe) : (Te = E, K = E * oe) : q / E > oe ? (Te = E, K = E * oe) : (K = q, Te = q / oe), K *= n, Te *= n;
  let xt = t === "black" ? "#000" : t === "white" ? "#fff" : t === "color" ? a : null,
    C = t === "blur" || t === "glow",
    N = `brightness(${s.b}) contrast(${s.c}) saturate(${s.s}) ${i}`,
    te = useRef(null),
    j = useRef(!1);
  return <div ref={te} style={{
    width: q,
    height: E,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 18px 44px rgba(0,0,0,0.55)",
    flex: "0 0 auto"
  }}>{!l && xt && <div style={{
      position: "absolute",
      inset: 0,
      background: xt
    }} />}{!l && t === "image" && <div style={{
      position: "absolute",
      inset: 0,
      background: o,
      backgroundSize: "cover"
    }} />}{!l && C && (w ? <video src={w.src} muted={!0} autoPlay={!0} loop={!0} playsInline={!0} style={{
      position: "absolute",
      inset: -24,
      width: "calc(100% + 48px)",
      height: "calc(100% + 48px)",
      objectFit: "cover",
      filter: t === "glow" ? `blur(${r}px) brightness(1.55) saturate(1.35)` : `blur(${r}px) brightness(0.92)`,
      transform: "scale(1.18)"
    }} /> : <div style={{
      position: "absolute",
      inset: -24,
      background: _e,
      backgroundSize: "cover",
      filter: t === "glow" ? `blur(${r}px) brightness(1.55) saturate(1.35)` : `blur(${r}px) brightness(0.92)`,
      transform: "scale(1.18)"
    }} />)}<div style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%,-50%)",
      width: Math.round(K),
      height: Math.round(Te),
      background: w ? "#000" : _e,
      backgroundSize: "cover",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      filter: N,
      borderRadius: l ? 0 : g,
      border: f > 0 ? `${f}px solid ${h}` : "none",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>{w ? <video src={w.src} autoPlay={!0} loop={!0} playsInline={!0} style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }} ref={z => {
        z && (z.dataset.ts = String(w.durationMs && c ? c[0] / 100 * w.durationMs / 1e3 : 0), z.dataset.te = String(w.durationMs && c ? c[1] / 100 * w.durationMs / 1e3 : 1e9), z.playbackRate = m || 1, z.volume = Math.min(1, (y == null ? 100 : y) / 100), z.muted = y === 0, z._rf || (z._rf = 1, z.addEventListener("timeupdate", () => {
          let U = parseFloat(z.dataset.ts),
            $ = parseFloat(z.dataset.te);
          (z.currentTime < U - 0.25 || z.currentTime > $) && (z.currentTime = U);
        }), z.addEventListener("loadeddata", () => {
          try {
            if (F && !z._thumbed) {
              z._thumbed = 1;
              let U = document.createElement("canvas"),
                $ = 96 / Math.max(z.videoWidth, 1);
              U.width = 96, U.height = Math.max(1, Math.round(z.videoHeight * $)), U.getContext("2d").drawImage(z, 0, 0, U.width, U.height), F(U.toDataURL("image/jpeg", 0.6));
            }
          } catch (U) {}
        }), z.paused && z.play().catch(() => {
          z.muted = !0, z.play().catch(() => {});
        })));
      }} /> : <div style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}><Play size={15} color="#fff" fill="#fff" /></div>}</div><div style={{
      position: "absolute",
      right: 7,
      bottom: 7,
      fontFamily: L.mono,
      fontSize: 7.5,
      color: "rgba(255,255,255,0.72)",
      background: "rgba(0,0,0,0.28)",
      padding: "2px 5px",
      borderRadius: 4,
      letterSpacing: "0.1em"
    }}>{"Reelfit"}</div>{x && (() => {
      let z = Wt[S] || Wt.Clean,
        U = A || {
          x: 0.5,
          y: (1 - z.posY) / 2
        },
        $ = Math.max(8, Math.round(0.045 * ((p || 100) / 100) * E)),
        b = (ue, Lt) => {
          if (!te.current) return;
          let ia = te.current.getBoundingClientRect(),
            yt = (ue - ia.left) / ia.width,
            da = (Lt - ia.top) / ia.height;
          yt = Math.max(0.04, Math.min(0.96, yt)), da = Math.max(0.05, Math.min(0.95, da)), M && M({
            x: yt,
            y: da
          });
        };
      return <div onPointerDown={ue => {
        j.current = !0, ue.currentTarget.setPointerCapture(ue.pointerId), ue.stopPropagation();
      }} onPointerMove={ue => {
        j.current && b(ue.clientX, ue.clientY);
      }} onPointerUp={() => {
        j.current = !1;
      }} style={{
        position: "absolute",
        left: U.x * 100 + "%",
        top: U.y * 100 + "%",
        transform: "translate(-50%,-50%)",
        whiteSpace: "nowrap",
        textAlign: "center",
        fontFamily: L.sans,
        fontWeight: z.weight,
        fontSize: $,
        lineHeight: 1.15,
        color: z.color,
        textShadow: z.shadow || "none",
        cursor: "move",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        padding: "3px 7px",
        borderRadius: 6,
        outline: "1px dashed rgba(255,255,255,0.55)",
        outlineOffset: 2
      }}><span style={z.bgBox ? {
          background: z.bgBox,
          padding: "2px 8px",
          borderRadius: 5
        } : {}}>{I || "YOUR TEXT"}</span></div>;
    })()}</div>;
}
function Onboarding({
  done: e
}) {
  let [t, a] = useState(0),
    o = [{
      title: `Post everywhere,
perfectly framed`,
      body: "One clip, every format. Reels, TikTok, Shorts, YouTube \u2014 no more ugly crops.",
      visual: <div style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center"
      }}>{["9:16", "1:1", "16:9"].map(n => {
          let s = filterAdjust(n, 70, 118);
          return <div style={{
            width: s.w,
            height: s.h,
            borderRadius: 8,
            background: _e,
            backgroundSize: "cover",
            boxShadow: "0 10px 24px rgba(0,0,0,0.5)"
          }} key={n} />;
        })}</div>
    }, {
      title: `Backgrounds
that pop`,
      body: "Blur or glow taken straight from your video \u2014 or drop in any color or your own image.",
      visual: <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }}><div style={{
          width: 84,
          height: 140,
          borderRadius: 10,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 28px rgba(0,0,0,0.5)"
        }}><div style={{
            position: "absolute",
            inset: 0,
            background: _e,
            backgroundSize: "cover",
            filter: "blur(10px) brightness(1.4) saturate(1.3)",
            transform: "scale(1.2)"
          }} /><div style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 84,
            height: 47,
            background: _e,
            backgroundSize: "cover",
            borderRadius: 4
          }} /></div><div style={{
          display: "flex",
          gap: 6
        }}>{["#000", "#fff", d.volt, "#15B79E"].map(n => <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: n,
            border: `1px solid ${d.line2}`
          }} key={n} />)}<div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "linear-gradient(135deg,#F6D365,#FDA085)"
          }} /></div></div>
    }, {
      title: `Caption, trim,
export in seconds`,
      body: "Auto-captions, filters, speed and music \u2014 all processed right on your device.",
      visual: <div style={{
        width: 84,
        height: 148,
        borderRadius: 10,
        background: _e,
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 12
      }}><div style={{
          display: "flex",
          gap: 8,
          marginBottom: 6
        }}>{[Sparkles, Scissors, Music].map((n, s) => <div style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "rgba(10,10,20,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} key={s}><n size={13} color="#fff" /></div>)}</div><div style={{
          position: "absolute",
          bottom: 46,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 10,
          color: "#fff",
          textShadow: "0 2px 6px rgba(0,0,0,0.7)"
        }}>{"CAPTIONS ✦"}</div></div>
    }],
    r = t === o.length - 1,
    l = o[t];
  return <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "8px 24px 22px"
  }}><div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}><Wordmark size={17} /><button onClick={e} style={{
        fontFamily: L.sans,
        fontWeight: 700,
        fontSize: 12,
        color: d.muted,
        background: "none",
        border: "none",
        cursor: "pointer"
      }}>{"Skip"}</button></div><div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 30
    }}><div style={{
        height: 150,
        display: "flex",
        alignItems: "center"
      }}>{l.visual}</div><div style={{
        textAlign: "center"
      }}><div style={{
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 24,
          color: d.bone,
          lineHeight: 1.15,
          whiteSpace: "pre-line",
          letterSpacing: "-0.02em"
        }}>{l.title}</div><div style={{
          fontFamily: L.sans,
          fontSize: 13,
          color: d.muted,
          marginTop: 12,
          lineHeight: 1.5,
          maxWidth: 250
        }}>{l.body}</div></div></div><div style={{
      display: "flex",
      justifyContent: "center",
      gap: 7,
      marginBottom: 18
    }}>{o.map((n, s) => <div style={{
        width: s === t ? 22 : 7,
        height: 7,
        borderRadius: 999,
        background: s === t ? d.volt : d.line2,
        transition: "all .2s"
      }} key={s} />)}</div><button onClick={() => r ? e() : a(t + 1)} style={{
      width: "100%",
      background: `linear-gradient(135deg, ${d.volt}, #4A24C4)`,
      border: "none",
      borderRadius: 14,
      padding: 15,
      fontFamily: L.sans,
      fontWeight: 800,
      fontSize: 15,
      color: "#fff",
      cursor: "pointer",
      boxShadow: `0 12px 30px ${d.voltDim}`
    }}>{r ? "Get started" : "Next"}</button></div>;
}
function CoachMarks({
  steps: e,
  screenRef: t,
  onDone: a
}) {
  let [o, r] = useState(0),
    [l, n] = useState(null),
    [s, i] = useState(600);
  if (useLayoutEffect(() => {
    let I = () => {
      let A = e[o].ref.current,
        M = t.current;
      if (A && M) {
        let p = A.getBoundingClientRect(),
          c = M.getBoundingClientRect();
        n({
          top: p.top - c.top,
          left: p.left - c.left,
          width: p.width,
          height: p.height
        }), i(c.height);
      }
    };
    I();
    let S = setTimeout(I, 80);
    return window.addEventListener("resize", I), () => {
      clearTimeout(S), window.removeEventListener("resize", I);
    };
  }, [o]), !l) return null;
  let f = 8,
    h = l.top + l.height < s * 0.55 ? {
      top: l.top + l.height + f + 6
    } : {
      bottom: s - l.top + f + 6
    },
    x = o === e.length - 1;
  return <div style={{
    position: "absolute",
    inset: 0,
    zIndex: 50
  }}><div style={{
      position: "absolute",
      top: l.top - f,
      left: l.left - f,
      width: l.width + f * 2,
      height: l.height + f * 2,
      borderRadius: 16,
      border: `2px solid ${d.volt}`,
      boxShadow: `0 0 0 2000px rgba(8,8,16,0.72), 0 0 22px 3px ${d.volt}`,
      pointerEvents: "none"
    }} /><div style={{
      position: "absolute",
      left: 18,
      right: 18,
      ...h,
      background: "rgba(25,25,38,0.86)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${d.volt}`,
      borderRadius: 16,
      padding: "14px 16px",
      boxShadow: "0 16px 40px rgba(0,0,0,0.5)"
    }}><div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }}><span style={{
          fontFamily: L.mono,
          fontSize: 10,
          color: d.volt,
          letterSpacing: "0.1em"
        }}>{o + 1}{" / "}{e.length}</span><button onClick={a} style={{
          fontFamily: L.sans,
          fontSize: 11,
          fontWeight: 700,
          color: d.muted,
          background: "none",
          border: "none",
          cursor: "pointer"
        }}>{"Skip"}</button></div><div style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 15,
        color: d.bone,
        marginBottom: 3
      }}>{e[o].title}</div><div style={{
        fontFamily: L.sans,
        fontSize: 12.5,
        color: d.mutedHi,
        lineHeight: 1.45,
        marginBottom: 12
      }}>{e[o].body}</div><button onClick={() => x ? a() : r(o + 1)} style={{
        width: "100%",
        background: d.volt,
        border: "none",
        borderRadius: 10,
        padding: "9px",
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 13,
        color: "#fff",
        cursor: "pointer"
      }}>{x ? "Got it" : "Next"}</button></div></div>;
}
function HomeScreen({
  go: e,
  coach: t,
  endCoach: a,
  screenRef: o,
  recents: r,
  resume: l
}) {
  let n = useRef(null),
    s = useRef(null),
    i = useRef(null),
    f = [{
      ref: n,
      title: "Start here",
      body: "Import any video from your gallery, or a clip you shared into Reelfit."
    }, {
      ref: s,
      title: "Or pick a format",
      body: "Jump straight to a platform \u2014 we frame the video to fit it perfectly."
    }, {
      ref: i,
      title: "Go further with Pro",
      body: "Unlock 4K, auto-captions, glow & image backgrounds, and batch export."
    }],
    g = [["Beach reel", "9:16"], ["Product ad", "1:1"], ["Podcast clip", "16:9"]];
  return <><div style={{
      flex: 1,
      overflowY: "auto",
      padding: "6px 20px 20px"
    }}><div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 22
      }}><div style={{
          display: "flex",
          alignItems: "center",
          gap: 10
        }}><img src={ps} alt="Reelfit" style={{
            width: 38,
            display: "block"
          }} /><div><Wordmark size={22} /><div style={{
              marginTop: 2
            }}><ByLine /></div></div></div><button ref={i} onClick={() => e("paywall")} style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: d.card,
          border: `1px solid ${d.line}`,
          borderRadius: 999,
          padding: "6px 11px 6px 9px",
          cursor: "pointer"
        }}><Crown size={14} color={d.volt} /><span style={{
            fontFamily: L.sans,
            fontWeight: 800,
            fontSize: 12,
            color: d.bone
          }}>{"Pro"}</span></button></div><div style={{
        fontFamily: L.serif,
        fontStyle: "italic",
        fontSize: 20,
        color: d.bone,
        lineHeight: 1.25,
        marginBottom: 16
      }}>{"Make any video fit"}<br />{"any platform."}</div><button ref={n} onClick={() => e("import")} style={{
        width: "100%",
        background: "linear-gradient(120deg, #7C4DFF, #4A24C4 80%)",
        border: "none",
        borderRadius: 20,
        padding: "22px 18px",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: `0 14px 34px ${d.voltDim}`,
        marginBottom: 12,
        position: "relative",
        overflow: "hidden"
      }}><div style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255,255,255,.14)",
          filter: "blur(30px)"
        }} /><div style={{
          display: "flex",
          alignItems: "center",
          gap: 13
        }}><div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto"
          }}><Upload size={22} color="#fff" /></div><div style={{
            flex: 1
          }}><div style={{
              fontFamily: L.sans,
              fontWeight: 800,
              fontSize: 16.5,
              color: "#fff"
            }}>{"Import video"}</div><div style={{
              fontFamily: L.sans,
              fontSize: 12,
              color: "rgba(255,255,255,0.78)"
            }}>{"From gallery or a shared clip"}</div></div><ChevronRight size={20} color="rgba(255,255,255,.85)" /></div></button><div style={{
        display: "flex",
        gap: 9,
        marginBottom: 20
      }}><button onClick={() => e("presets")} style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          background: d.card,
          border: `1px solid ${d.line}`,
          borderRadius: 13,
          padding: "11px 10px",
          cursor: "pointer"
        }}><Layers size={15} color={d.volt} /><span style={{
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 12,
            color: d.bone
          }}>{"Batch"}</span><span style={{
            fontFamily: L.mono,
            fontSize: 7.5,
            fontWeight: 700,
            color: "#fff",
            background: d.volt,
            padding: "1px 5px",
            borderRadius: 4
          }}>{"PRO"}</span></button><button onClick={() => e("presets")} style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          background: d.card,
          border: `1px solid ${d.line}`,
          borderRadius: 13,
          padding: "11px 10px",
          cursor: "pointer"
        }}><Share2 size={15} color={d.volt} /><span style={{
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 12,
            color: d.bone
          }}>{"Shared clips"}</span></button></div><div ref={s}><div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10
        }}><span style={{
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 12,
            color: d.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em"
          }}>{"Quick presets"}</span><button onClick={() => e("presets")} style={{
            background: "none",
            border: "none",
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 11.5,
            color: d.volt,
            cursor: "pointer",
            padding: 4
          }}>{"See all →"}</button></div><div style={{
          display: "flex",
          gap: 9,
          overflowX: "auto",
          paddingBottom: 6,
          marginBottom: 16
        }}>{[["Reels", "9:16", "#E1306C"], ["TikTok", "9:16", "#25F4EE"], ["YouTube", "16:9", "#FF0000"], ["IG Post", "4:5", "#C13584"], ["Square", "1:1", "#6C3AFF"]].map(([h, x, I]) => <button onClick={() => e("presets")} style={{
            flex: "0 0 auto",
            width: 92,
            background: d.card,
            border: `1px solid ${d.line}`,
            borderRadius: 14,
            padding: "11px 10px",
            cursor: "pointer",
            textAlign: "left",
            position: "relative",
            overflow: "hidden"
          }} key={h}><div style={{
              position: "absolute",
              top: -18,
              right: -18,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: I,
              opacity: 0.18,
              filter: "blur(16px)"
            }} /><div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              marginBottom: 8,
              background: `linear-gradient(135deg, ${I}14, ${d.eclipse2} 75%)`,
              border: `1px solid ${I}30`,
              borderRadius: 9
            }}><AspectGlyph r={x} color={I} /></div><div style={{
              fontFamily: L.sans,
              fontWeight: 800,
              fontSize: 11.5,
              color: d.bone
            }}>{h}</div><div style={{
              fontFamily: L.mono,
              fontSize: 9,
              color: I,
              marginTop: 1
            }}>{x}</div></button>)}</div></div><div style={{
        fontFamily: L.sans,
        fontWeight: 700,
        fontSize: 12,
        color: d.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 10
      }}>{"Recent projects"}</div><div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>{(!r || r.length === 0) && <div style={{
          background: d.card,
          border: `1px dashed ${d.line2}`,
          borderRadius: 14,
          padding: "16px 14px",
          fontFamily: L.sans,
          fontSize: 12,
          color: d.muted,
          textAlign: "center"
        }}>{"No projects yet — import your first clip above."}</div>}{(r || []).map(h => <button onClick={() => l(h)} style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: d.card,
          border: `1px solid ${d.line}`,
          borderRadius: 14,
          padding: 11,
          cursor: "pointer",
          textAlign: "left"
        }} key={h.id}><div style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: h.thumb ? `url(${h.thumb}) center/cover` : _e,
            backgroundSize: "cover",
            flex: "0 0 auto",
            border: `1px solid ${d.line2}`
          }} /><div style={{
            flex: 1
          }}><div style={{
              fontFamily: L.sans,
              fontWeight: 700,
              fontSize: 13,
              color: d.bone
            }}>{"Export " + (h.ratio || "")}</div><div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 3
            }}><span style={{
                fontFamily: L.mono,
                fontSize: 9,
                color: d.volt,
                background: "rgba(108,58,255,.14)",
                padding: "1px 6px",
                borderRadius: 5
              }}>{h.ratio}</span><span style={{
                fontFamily: L.sans,
                fontSize: 10.5,
                color: d.muted
              }}>{h.when}</span></div></div><span style={{
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 11.5,
            color: d.volt
          }}>{"Resume"}</span></button>)}</div></div><BottomNav nav="home" go={e} />{t && <CoachMarks steps={f} screenRef={o} onDone={a} />}</>;
}
function Presets({
  go: e,
  setFmt: t,
  ensureMedia: a
}) {
  let o = [["Vertical \xB7 9:16", [["Reels", "9:16", "Instagram", "#E1306C"], ["Story", "9:16", "IG / FB", "#F77737"], ["TikTok", "9:16", "For You", "#25F4EE"], ["Shorts", "9:16", "YouTube", "#FF0033"]]], ["Feed", [["IG Post", "4:5", "Portrait", "#C13584"], ["Square", "1:1", "Feed", "#6C3AFF"], ["Pin", "3:4", "Pinterest", "#E60023"]]], ["Landscape", [["YouTube", "16:9", "Standard", "#FF0000"], ["Cinematic", "16:9", "Widescreen", "#8A5BFF"]]]];
  return <><TopBar title="Choose format" onBack={() => e("home")} /><div style={{
      flex: 1,
      overflowY: "auto",
      padding: "4px 20px 20px"
    }}><div style={{
        fontFamily: L.sans,
        fontSize: 12.5,
        color: d.muted,
        marginBottom: 14
      }}>{"Pick where you're posting. We'll frame it perfectly."}</div><button onClick={() => e("paywall")} style={{
        width: "100%",
        background: `linear-gradient(120deg, ${d.volt}, #4A24C4 70%)`,
        border: "none",
        borderRadius: 18,
        padding: "15px 16px",
        cursor: "pointer",
        textAlign: "left",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 10px 26px ${d.voltDim}`
      }}><div style={{
          position: "absolute",
          top: -30,
          right: -20,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,.16)",
          filter: "blur(26px)"
        }} /><div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}><div><div style={{
              fontFamily: L.sans,
              fontWeight: 800,
              fontSize: 14.5,
              color: "#fff",
              marginBottom: 3
            }}>{"✦ All platforms at once"}</div><div style={{
              fontFamily: L.sans,
              fontSize: 11,
              color: "rgba(255,255,255,.82)"
            }}>{"Batch-export every format in one run"}</div></div><span style={{
            fontFamily: L.mono,
            fontSize: 9,
            fontWeight: 700,
            color: d.volt,
            background: "#fff",
            padding: "3px 8px",
            borderRadius: 6
          }}>{"PRO"}</span></div></button>{o.map(([r, l]) => <div style={{
        marginBottom: 18
      }} key={r}><div style={{
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 11,
          color: d.volt,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 9
        }}>{r}</div><div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 11
        }}>{l.map(([n, s, i, f]) => <button onClick={() => {
            t(s), a(() => e("editor"));
          }} style={{
            background: d.card,
            border: `1px solid ${d.line}`,
            borderRadius: 16,
            padding: 13,
            cursor: "pointer",
            textAlign: "left",
            position: "relative",
            overflow: "hidden"
          }} key={n}><div style={{
              position: "absolute",
              top: -22,
              right: -22,
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: f,
              opacity: 0.16,
              filter: "blur(22px)"
            }} /><div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 58,
              marginBottom: 10,
              background: `linear-gradient(135deg, ${f}14, ${d.eclipse2} 70%)`,
              border: `1px solid ${f}33`,
              borderRadius: 11
            }}><AspectGlyph r={s} color={f} /></div><div style={{
              display: "flex",
              alignItems: "center",
              gap: 6
            }}><span style={{
                width: 7,
                height: 7,
                borderRadius: 2,
                background: f,
                transform: "rotate(45deg)",
                flex: "0 0 auto"
              }} /><span style={{
                fontFamily: L.sans,
                fontWeight: 800,
                fontSize: 13.5,
                color: d.bone
              }}>{n}</span></div><div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              paddingLeft: 13
            }}><span style={{
                fontFamily: L.sans,
                fontSize: 10.5,
                color: d.muted
              }}>{i}</span><span style={{
                fontFamily: L.mono,
                fontSize: 10,
                color: f
              }}>{s}</span></div></button>)}</div></div>)}</div><BottomNav nav="home" go={e} /></>;
}
function Editor({
  go: e,
  initialRatio: t,
  onExport: a,
  media: o,
  onThumb: r,
  registerBack: l
}) {
  let [n, s] = useState("bg"),
    [i, f] = useState(t || "9:16"),
    [g, h] = useState(!1),
    [x, I] = useState(88),
    [S, A] = useState("blur"),
    [M, p] = useState("#6C3AFF"),
    [c, m] = useState(dc[0]),
    [y, F] = useState(22),
    [w, B] = useState({
      b: 100,
      c: 100,
      s: 100
    }),
    [T, q] = useState("none"),
    [E, oe] = useState(1),
    [K, Te] = useState(0),
    [xt, C] = useState("#FFFFFF"),
    [N, te] = useState(0),
    [j, z] = useState(!1),
    [U, $] = useState([8, 92]),
    [b, ue] = useState(100),
    [Lt, ia] = useState("YOUR TEXT"),
    [yt, da] = useState("Clean"),
    [gs, dr] = useState(!1),
    [hs, Ya] = useState(!1),
    [xs, Ul] = useState(null),
    [fr, Cc] = useState(100),
    Ls = useRef({}),
    [kc, wc] = useState(null),
    [ys, Is] = useState(""),
    Ka = o && o.durationMs ? o.durationMs / 1e3 : 15,
    Nl = k => Math.floor(k / 60) + ":" + String(Math.round(k % 60)).padStart(2, "0"),
    [vs, Hl] = useState(!1);
  Ls.current = {
    colorSheet: gs,
    textSheet: hs,
    showExport: vs
  }, useEffect(() => {
    if (l) return l(() => {
      try {
        let k = Ls.current || {};
        if (k.colorSheet) return dr(!1), !0;
        if (k.textSheet) return Ya(!1), !0;
        if (k.showExport) return Hl(!1), !0;
      } catch (k) {}
      return !1;
    }), () => {
      try {
        l(null);
      } catch (k) {}
    };
  }, []);
  let Ac = Ol.find(k => k.k === T).css,
    Pc = [{
      k: "format",
      I: Maximize2,
      l: "Format"
    }, {
      k: "bg",
      I: Image,
      l: "Background"
    }, {
      k: "adjust",
      I: SlidersHorizontal,
      l: "Adjust"
    }, {
      k: "filter",
      I: WandSparkles,
      l: "Filters"
    }, {
      k: "trim",
      I: Scissors,
      l: "Trim"
    }, {
      k: "speed",
      I: Gauge,
      l: "Speed"
    }, {
      k: "audio",
      I: Music,
      l: "Audio"
    }, {
      k: "text",
      I: Type,
      l: "Text"
    }, {
      k: "border",
      I: Square,
      l: "Border"
    }, {
      k: "captions",
      I: Sparkles,
      l: "Captions",
      pro: !0
    }],
    Fc = [{
      k: "black",
      l: "Black"
    }, {
      k: "white",
      l: "White"
    }, {
      k: "color",
      l: "Color"
    }, {
      k: "blur",
      l: "Blur"
    }, {
      k: "glow",
      l: "Glow"
    }, {
      k: "image",
      l: "Image"
    }];
  return <><TopBar title="Editor" onBack={() => e("presets")} right={<div style={{
      display: "flex",
      gap: 8,
      alignItems: "center"
    }}><button onClick={() => {
        B({
          b: 100,
          c: 100,
          s: 100
        }), q("none"), Te(0), te(0), I(88);
      }} title="Reset" style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 2
      }}><RotateCcw size={17} color={d.muted} /></button><button onClick={() => Hl(!0)} style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 13,
        color: "#fff",
        background: d.volt,
        border: "none",
        padding: "7px 15px",
        borderRadius: 999,
        cursor: "pointer"
      }}>{"Export"}</button></div>} /><div style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(80% 60% at 50% 40%, #14141f, #0A0A14)",
      minHeight: 0
    }}><Preview ratio={i} bgType={g ? "black" : S} bgColor={M} bgImage={c} blurAmt={y} fill={g} scale={x / 100} adj={{
        b: w.b / 100,
        c: w.c / 100,
        s: w.s / 100
      }} filterCss={Ac} border={K} radius={N} borderColor={xt} showText={j} textValue={Lt} textStyle={yt} textPos={xs} onTextMove={Ul} textScale={fr} trim={U} speed={E} vol={b} onThumb={r} media={o} /></div><div style={{
      background: d.eclipse2,
      borderTop: `1px solid ${d.line}`,
      padding: "13px 16px 6px",
      flex: "0 0 auto",
      minHeight: 128,
      maxHeight: 200,
      overflowY: "auto"
    }}>{n === "format" && <><div style={{
          display: "flex",
          gap: 6,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }}>{Object.keys(is).map(k => <Pill small={!0} active={i === k} onClick={() => f(k)} key={k}>{k}</Pill>)}<button onClick={() => h(!g)} style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 11,
            padding: "6px 11px",
            borderRadius: 999,
            border: `1px solid ${d.line2}`,
            background: g ? d.volt : "transparent",
            color: g ? "#fff" : d.mutedHi,
            cursor: "pointer"
          }}><Maximize2 size={12} />{" "}{g ? "Fill" : "Fit"}</button></div>{!g && <Slider label="Scale" min={40} max={100} value={x} onChange={I} valLabel={x + "%"} />}</>}{n === "bg" && <><div style={{
          display: "flex",
          gap: 7,
          marginBottom: 12,
          overflowX: "auto",
          paddingBottom: 2,
          opacity: g ? 0.4 : 1,
          pointerEvents: g ? "none" : "auto"
        }}>{Fc.map(k => <button onClick={() => A(k.k)} style={{
            flex: "0 0 auto",
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
            width: 50
          }} key={k.k}><div style={{
              height: 44,
              borderRadius: 10,
              marginBottom: 5,
              position: "relative",
              overflow: "hidden",
              border: S === k.k ? `2px solid ${d.volt}` : `1px solid ${d.line2}`,
              background: k.k === "black" ? "#000" : k.k === "white" ? "#fff" : k.k === "color" ? M : k.k === "image" ? c : _e,
              backgroundSize: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>{(k.k === "blur" || k.k === "glow") && <div style={{
                position: "absolute",
                inset: 0,
                background: _e,
                backgroundSize: "cover",
                filter: k.k === "glow" ? "blur(6px) brightness(1.5) saturate(1.3)" : "blur(6px)"
              }} />}{k.k === "image" && <Image size={15} color="rgba(255,255,255,0.9)" style={{
                position: "relative"
              }} />}{k.k === "color" && <Palette size={14} color={M === "#FFFFFF" ? "#000" : "#fff"} style={{
                position: "relative"
              }} />}</div><div style={{
              fontFamily: L.sans,
              fontWeight: 700,
              fontSize: 10,
              color: S === k.k ? d.bone : d.muted,
              textAlign: "center"
            }}>{k.l}</div></button>)}</div>{!g && (S === "blur" || S === "glow") && <Slider label={S === "glow" ? "Glow intensity" : "Blur intensity"} min={5} max={40} value={y} onChange={F} valLabel={y} />}{!g && S === "color" && <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          paddingTop: 2
        }}>{lg.map(k => <button onClick={() => p(k)} style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: k,
            cursor: "pointer",
            border: M === k ? `2px solid ${d.volt}` : `1px solid ${d.line2}`
          }} key={k} />)}<button onClick={() => dr(!0)} style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "conic-gradient(from 0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${d.line2}`,
            cursor: "pointer"
          }}><Plus size={13} color="#fff" /></button></div>}{!g && S === "image" && <div style={{
          display: "flex",
          gap: 8,
          paddingTop: 2
        }}><button onClick={async () => {
            let k = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport;
            if (k) try {
              let qe = await k.pickImage();
              wc(qe.path), m("url(" + window.Capacitor.convertFileSrc(qe.path) + ") center/cover");
            } catch (qe) {}
          }} style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            border: `1.5px dashed ${d.line2}`,
            background: d.card,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flex: "0 0 auto"
          }}><Upload size={15} color={d.volt} /><span style={{
              fontFamily: L.sans,
              fontSize: 8,
              color: d.muted,
              marginTop: 2
            }}>{"Upload"}</span></button>{dc.map(k => <button onClick={() => m(k)} style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: k,
            cursor: "pointer",
            border: c === k ? `2px solid ${d.volt}` : `1px solid ${d.line2}`,
            flex: "0 0 auto"
          }} key={k} />)}</div>}{g && <div style={{
          fontFamily: L.sans,
          fontSize: 11.5,
          color: d.muted,
          paddingTop: 4
        }}>{"Background is hidden in Fill — the video covers the whole frame. Switch to Fit to use a background."}</div>}</>}{n === "adjust" && <div style={{
        paddingTop: 2
      }}><Slider label="Brightness" min={50} max={150} value={w.b} onChange={k => B({
          ...w,
          b: k
        })} valLabel={w.b - 100} /><Slider label="Contrast" min={50} max={150} value={w.c} onChange={k => B({
          ...w,
          c: k
        })} valLabel={w.c - 100} /><Slider label="Saturation" min={0} max={200} value={w.s} onChange={k => B({
          ...w,
          s: k
        })} valLabel={w.s - 100} /></div>}{n === "filter" && <div><div style={{
          display: "flex",
          gap: 9,
          overflowX: "auto",
          paddingBottom: 4
        }}>{Ol.map(k => <button onClick={() => q(k.k)} style={{
            flex: "0 0 auto",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            width: 52,
            position: "relative"
          }} key={k.k}><div style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: _e,
              backgroundSize: "cover",
              filter: k.css,
              marginBottom: 5,
              border: T === k.k ? `2px solid ${d.volt}` : `1px solid ${d.line2}`,
              opacity: k.pro ? 0.92 : 1
            }} />{k.pro && <span style={{
              position: "absolute",
              top: 3,
              right: 3,
              fontFamily: L.mono,
              fontSize: 7,
              fontWeight: 700,
              color: "#fff",
              background: d.volt,
              padding: "1px 4px",
              borderRadius: 4
            }}>{"PRO"}</span>}<div style={{
              fontFamily: L.sans,
              fontWeight: 700,
              fontSize: 10,
              color: T === k.k ? d.bone : d.muted,
              textAlign: "center",
              whiteSpace: "nowrap"
            }}>{k.l}</div></button>)}</div><button onClick={() => e("paywall")} style={{
          background: "none",
          border: "none",
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 11,
          color: d.volt,
          cursor: "pointer",
          padding: "6px 0 0"
        }}>{"Unlock all 16 filters with Pro →"}</button></div>}{n === "trim" && <div style={{
        paddingTop: 4
      }}><div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8
        }}><span style={{
            fontFamily: L.mono,
            fontSize: 10,
            color: d.mutedHi
          }}>{Nl(U[0] / 100 * Ka)}</span><span style={{
            fontFamily: L.mono,
            fontSize: 10,
            color: d.volt
          }}>{"Duration "}{Nl((U[1] - U[0]) / 100 * Ka)}</span><span style={{
            fontFamily: L.mono,
            fontSize: 10,
            color: d.mutedHi
          }}>{Nl(Ka)}</span></div><div style={{
          position: "relative",
          height: 44,
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          gap: 2
        }}>{Array.from({
            length: 8
          }).map((k, qe) => <div style={{
            flex: 1,
            background: _e,
            backgroundSize: "cover",
            opacity: 0.85
          }} key={qe} />)}<div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${U[0]}%`,
            background: "rgba(8,8,16,0.7)"
          }} /><div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: `${100 - U[1]}%`,
            background: "rgba(8,8,16,0.7)"
          }} /><div style={{
            position: "absolute",
            top: -1,
            bottom: -1,
            left: `${U[0]}%`,
            width: 8,
            marginLeft: -4,
            background: d.volt,
            borderRadius: 3
          }} /><div style={{
            position: "absolute",
            top: -1,
            bottom: -1,
            left: `${U[1]}%`,
            width: 8,
            marginLeft: -4,
            background: d.volt,
            borderRadius: 3
          }} /></div><div style={{
          display: "flex",
          gap: 10,
          marginTop: 8
        }}><div style={{
            flex: 1
          }}><Slider label="Start" min={0} max={U[1] - 5} value={U[0]} onChange={k => $([k, U[1]])} valLabel={U[0] + "%"} /></div><div style={{
            flex: 1
          }}><Slider label="End" min={U[0] + 5} max={100} value={U[1]} onChange={k => $([U[0], k])} valLabel={U[1] + "%"} /></div></div></div>}{n === "speed" && <div style={{
        paddingTop: 4
      }}><div style={{
          display: "flex",
          gap: 7,
          marginBottom: 10
        }}>{[0.25, 0.5, 1, 1.5, 2].map(k => <Pill small={!0} active={k === E} onClick={() => oe(k)} key={k}>{k}{"x"}</Pill>)}</div><div style={{
          fontFamily: L.sans,
          fontSize: 11.5,
          color: d.muted
        }}>{E === 1 ? "Normal speed." : `${E}x \u2014 about ${(Ka / E).toFixed(1)}s instead of ${Ka.toFixed(1)}s. Audio keeps its pitch.`}</div></div>}{n === "audio" && <div style={{
        paddingTop: 2
      }}><div style={{
          display: "flex",
          gap: 8,
          marginBottom: 10
        }}><button onClick={() => Is("Music mixing arrives with the captions update")} style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: d.card,
            border: `1px solid ${d.line2}`,
            borderRadius: 10,
            padding: "10px",
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 12,
            color: d.bone,
            cursor: "pointer",
            opacity: 0.8,
            position: "relative"
          }}><Music size={14} color={d.volt} />{" Add music"}<span style={{
              position: "absolute",
              top: -6,
              right: -4,
              fontFamily: L.mono,
              fontSize: 7,
              fontWeight: 700,
              color: "#fff",
              background: d.volt,
              padding: "1px 5px",
              borderRadius: 4
            }}>{"SOON"}</span></button><button onClick={() => Is("Voiceover recording arrives with the captions update")} style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: d.card,
            border: `1px solid ${d.line2}`,
            borderRadius: 10,
            padding: "10px",
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 12,
            color: d.bone,
            cursor: "pointer",
            opacity: 0.8,
            position: "relative"
          }}><Volume2 size={14} color={d.volt} />{" Voiceover"}<span style={{
              position: "absolute",
              top: -6,
              right: -4,
              fontFamily: L.mono,
              fontSize: 7,
              fontWeight: 700,
              color: "#fff",
              background: d.volt,
              padding: "1px 5px",
              borderRadius: 4
            }}>{"SOON"}</span></button></div><div style={{
          fontFamily: L.sans,
          fontSize: 11,
          fontWeight: 600,
          color: d.mutedHi,
          marginBottom: 7
        }}>{"Original audio"}</div><Slider label="Volume" min={0} max={100} value={b} onChange={ue} valLabel={b === 0 ? "Muted" : b + "%"} /><div style={{
          display: "flex",
          gap: 7,
          marginBottom: 8
        }}><Pill small={!0} active={b === 0} onClick={() => ue(0)}>{"Mute"}</Pill><Pill small={!0} active={b === 50} onClick={() => ue(50)}>{"50%"}</Pill><Pill small={!0} active={b === 100} onClick={() => ue(100)}>{"100%"}</Pill></div>{b === 0 && <div style={{
          fontFamily: L.sans,
          fontSize: 11,
          color: d.muted
        }}>{"Export will have no sound."}</div>}{ys && <div style={{
          fontFamily: L.sans,
          fontSize: 11,
          color: d.volt,
          marginTop: 6
        }}>{ys}</div>}</div>}{n === "text" && <div style={{
        paddingTop: 2
      }}><button onClick={() => Ya(!0)} style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          background: j ? d.voltDim : d.card,
          border: `1px solid ${j ? d.volt : d.line2}`,
          borderRadius: 10,
          padding: "11px",
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 12.5,
          color: d.bone,
          cursor: "pointer",
          marginBottom: 10
        }}><Type size={15} color={d.volt} />{" "}{j ? "Edit text" : "Add text"}</button><div style={{
          display: "flex",
          gap: 7,
          overflowX: "auto"
        }}>{["Clean", "Bold", "Neon", "Caption", "Meme"].map(k => <Pill small={!0} active={yt === k} onClick={() => {
            da(k), j || z(!0);
          }} key={k}>{k}</Pill>)}</div>{j && <div style={{
          fontFamily: L.sans,
          fontSize: 11,
          color: d.muted,
          marginTop: 9,
          marginBottom: 10
        }}>{"Drag the text in the preview to place it anywhere on the canvas."}</div>}{j && <Slider label="Text size" min={50} max={200} value={fr} onChange={Cc} valLabel={fr + "%"} />}</div>}{n === "border" && <div style={{
        paddingTop: 2
      }}><Slider label="Border width" min={0} max={14} value={K} onChange={Te} valLabel={K + "px"} /><Slider label="Corner radius" min={0} max={28} value={N} onChange={te} valLabel={N + "px"} /><div style={{
          display: "flex",
          gap: 8
        }}>{["#FFFFFF", "#0A0A14", d.volt, "#F5A623", "#15B79E"].map(k => <button onClick={() => {
            C(k), K === 0 && Te(4);
          }} style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: k,
            cursor: "pointer",
            border: xt === k ? `2px solid ${d.volt}` : `1px solid ${d.line2}`
          }} key={k} />)}</div></div>}{n === "captions" && <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0",
        textAlign: "center"
      }}><div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6
        }}><Sparkles size={16} color={d.volt} /><span style={{
            fontFamily: L.sans,
            fontWeight: 800,
            fontSize: 14,
            color: d.bone
          }}>{"Auto-captions"}</span><span style={{
            fontFamily: L.mono,
            fontSize: 9,
            color: d.volt,
            background: "rgba(108,58,255,.16)",
            padding: "2px 7px",
            borderRadius: 6
          }}>{"2 FREE LEFT"}</span></div><div style={{
          fontFamily: L.sans,
          fontSize: 11.5,
          color: d.muted,
          marginBottom: 12,
          maxWidth: 250
        }}>{"Transcribed on-device — free & private, no upload. Burned in with animated styles. "}<span style={{
            color: d.bone,
            fontWeight: 700
          }}>{"Unlimited on Pro."}</span></div><button style={{
          background: d.volt,
          border: "none",
          borderRadius: 10,
          padding: "9px 20px",
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 12.5,
          color: "#fff",
          cursor: "pointer",
          marginBottom: 8
        }}>{"Generate captions"}</button><button onClick={() => e("paywall")} style={{
          background: "none",
          border: "none",
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 11.5,
          color: d.volt,
          cursor: "pointer"
        }}>{"Get unlimited with Pro →"}</button></div>}</div><div style={{
      display: "flex",
      gap: 4,
      overflowX: "auto",
      background: d.eclipse,
      borderTop: `1px solid ${d.line}`,
      padding: "8px 10px",
      flex: "0 0 auto"
    }}>{Pc.map(({
        k,
        I: qe,
        l: ql,
        pro: Rc
      }) => {
        let Ja = n === k;
        return <button onClick={() => s(k)} style={{
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 8px",
          position: "relative",
          minWidth: 54
        }} key={k}><div style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: Ja ? d.voltDim : d.card,
            border: `1px solid ${Ja ? d.volt : d.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}><qe size={17} color={Ja ? d.volt : d.mutedHi} />{Rc && <div style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: d.volt,
              borderRadius: 999,
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}><Lock size={7} color="#fff" /></div>}</div><span style={{
            fontFamily: L.sans,
            fontSize: 9.5,
            fontWeight: Ja ? 700 : 500,
            color: Ja ? d.volt : d.muted
          }}>{ql}</span></button>;
      })}</div>{vs && <ExportSheet go={e} close={() => Hl(!1)} ratio={i} onExport={() => a({
      ratio: i,
      fill: g,
      bgType: S,
      bgColor: M,
      blurAmt: y,
      filter: T,
      adj: w,
      trim: U,
      speed: E,
      vol: b,
      border: K,
      borderColor: xt,
      radius: N,
      bgImagePath: kc,
      text: j ? {
        value: Lt,
        style: yt,
        pos: xs,
        scale: fr
      } : null
    })} />}{gs && <ColorSheet initial={M} onCancel={() => dr(!1)} onSet={k => {
      p(k), dr(!1);
    }} />}{hs && <TextSheet initialValue={Lt} initialStyle={yt} onCancel={() => Ya(!1)} onDone={(k, qe) => {
      ia(k), da(qe), z(!0), Ul(ql => ql || {
        x: 0.5,
        y: (1 - (Wt[qe] ? Wt[qe].posY : 0)) / 2
      }), Ya(!1);
    }} onRemove={j ? () => {
      z(!1), Ul(null), Ya(!1);
    } : null} />}</>;
}
function ExportSheet({
  go: e,
  close: t,
  ratio: a,
  onExport: o
}) {
  let [r, l] = useState("1080p"),
    [n, s] = useState("MP4"),
    i = [{
      k: "720p",
      pro: !1
    }, {
      k: "1080p",
      pro: !1
    }, {
      k: "4K",
      pro: !0
    }];
  return <div style={{
    position: "absolute",
    inset: 0,
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end"
  }}><div onClick={t} style={{
      position: "absolute",
      inset: 0,
      background: "rgba(6,6,12,0.6)",
      backdropFilter: "blur(2px)"
    }} /><div style={{
      position: "relative",
      background: d.eclipse2,
      borderTop: `1px solid ${d.line2}`,
      borderRadius: "22px 22px 0 0",
      padding: "18px 20px 22px"
    }}><div style={{
        width: 38,
        height: 4,
        borderRadius: 999,
        background: d.line2,
        margin: "0 auto 16px"
      }} /><div style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 17,
        color: d.bone,
        marginBottom: 14
      }}>{"Export video"}</div><div style={{
        fontFamily: L.sans,
        fontWeight: 700,
        fontSize: 11,
        color: d.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8
      }}>{"Resolution"}</div><div style={{
        display: "flex",
        gap: 8,
        marginBottom: 16
      }}>{i.map(f => <button onClick={() => f.pro ? e("paywall") : l(f.k)} style={{
          flex: 1,
          position: "relative",
          background: r === f.k ? d.voltDim : d.card,
          border: `1.5px solid ${r === f.k ? d.volt : d.line}`,
          borderRadius: 12,
          padding: "12px 0",
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 14,
          color: d.bone,
          cursor: "pointer"
        }} key={f.k}>{f.k}{f.pro && <div style={{
            position: "absolute",
            top: 5,
            right: 5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: d.volt,
            borderRadius: 6,
            padding: "1px 4px"
          }}><Lock size={7} color="#fff" /><span style={{
              fontFamily: L.mono,
              fontSize: 7,
              color: "#fff"
            }}>{"PRO"}</span></div>}</button>)}</div><div style={{
        fontFamily: L.sans,
        fontWeight: 700,
        fontSize: 11,
        color: d.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8
      }}>{"Format"}</div><div style={{
        display: "flex",
        gap: 8,
        marginBottom: 20
      }}>{["MP4", "MOV", "GIF"].map(f => <button onClick={() => s(f)} style={{
          flex: 1,
          background: n === f ? d.voltDim : d.card,
          border: `1.5px solid ${n === f ? d.volt : d.line}`,
          borderRadius: 12,
          padding: "11px 0",
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 13,
          color: d.bone,
          cursor: "pointer"
        }} key={f}>{f}</button>)}</div><button onClick={() => {
        t(), o ? o() : e("exporting");
      }} style={{
        width: "100%",
        background: `linear-gradient(135deg, ${d.volt}, #4A24C4)`,
        border: "none",
        borderRadius: 14,
        padding: 15,
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 15,
        color: "#fff",
        cursor: "pointer"
      }}>{"Export "}{r}{" · "}{n}</button></div></div>;
}
function Exporting({
  go: e,
  pct: t
}) {
  let a = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport),
    [o, r] = useState(0);
  useEffect(() => {
    if (a) return;
    let i = setInterval(() => r(f => f >= 100 ? (clearInterval(i), setTimeout(() => e("success"), 350), 100) : f + 4), 68);
    return () => clearInterval(i);
  }, []);
  let l = a ? Math.min(100, t || 0) : o,
    n = 52,
    s = 2 * Math.PI * n;
  return <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 30
  }}><div style={{
      position: "relative",
      width: 140,
      height: 140,
      marginBottom: 26
    }}><svg width="140" height="140" style={{
        transform: "rotate(-90deg)"
      }}><circle cx="70" cy="70" r={n} stroke={d.card} strokeWidth="9" fill="none" /><circle cx="70" cy="70" r={n} stroke={d.volt} strokeWidth="9" fill="none" strokeDasharray={s} strokeDashoffset={s - l / 100 * s} strokeLinecap="round" style={{
          transition: "stroke-dashoffset .1s linear"
        }} /></svg><div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: L.mono,
        fontSize: 26,
        fontWeight: 700,
        color: d.bone
      }}>{l}{"%"}</div></div><div style={{
      fontFamily: L.sans,
      fontWeight: 800,
      fontSize: 17,
      color: d.bone,
      marginBottom: 5
    }}>{"Exporting your video…"}</div><div style={{
      fontFamily: L.sans,
      fontSize: 12.5,
      color: d.muted,
      textAlign: "center"
    }}>{"Processing on your device · 1080p · H.264"}</div></div>;
}
function Success({
  go: e,
  result: t
}) {
  return <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 20
  }}><div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}><div style={{
        width: 66,
        height: 66,
        borderRadius: 999,
        background: d.voltDim,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        border: `1px solid ${d.volt}`
      }}><Check size={30} color={d.volt} /></div><div style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 19,
        color: d.bone,
        marginBottom: 5
      }}>{"Ready to post"}</div><div style={{
        fontFamily: L.sans,
        fontSize: 12.5,
        color: d.muted,
        marginBottom: 22,
        textAlign: "center",
        padding: "0 14px",
        wordBreak: "break-all"
      }}>{t ? `Saved: ${t.saved} \xB7 ${(t.durationMs / 1e3).toFixed(1)}s` : "Reel \xB7 9:16 \xB7 saved to your library"}</div><div style={{
        display: "flex",
        gap: 11,
        marginBottom: 22
      }}><button onClick={() => {
          let a = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport;
          a && t && t.uri && a.openVideo({
            uri: t.uri
          }).catch(() => {});
        }} style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 13,
          color: d.bone,
          background: d.card,
          border: `1px solid ${d.line2}`,
          padding: "12px 18px",
          borderRadius: 12,
          cursor: "pointer"
        }}><Download size={16} />{" Open"}</button><button onClick={() => {
          let a = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport;
          a && t && t.uri && a.shareVideo({
            uri: t.uri
          }).catch(() => {});
        }} style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 13,
          color: "#fff",
          background: d.volt,
          border: "none",
          padding: "12px 22px",
          borderRadius: 12,
          cursor: "pointer"
        }}><Share2 size={16} />{" Share"}</button></div></div><button onClick={() => e("paywall")} style={{
      width: "100%",
      background: d.card,
      border: `1px solid ${d.volt}`,
      borderRadius: 16,
      padding: "14px 16px",
      cursor: "pointer",
      textAlign: "left",
      marginBottom: 10
    }}><div style={{
        display: "flex",
        alignItems: "center",
        gap: 12
      }}><div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: d.voltDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}><Sparkles size={19} color={d.volt} /></div><div style={{
          flex: 1
        }}><div style={{
            fontFamily: L.sans,
            fontWeight: 800,
            fontSize: 13.5,
            color: d.bone
          }}>{"Remove watermark"}</div><div style={{
            fontFamily: L.sans,
            fontSize: 11.5,
            color: d.muted
          }}>{"Watch a short ad — or go Pro"}</div></div></div></button><button onClick={() => e("home")} style={{
      width: "100%",
      fontFamily: L.sans,
      fontWeight: 700,
      fontSize: 13,
      color: d.muted,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 8
    }}>{"Done"}</button></div>;
}
function Paywall({
  go: e
}) {
  let [t, a] = useState("year"),
    o = ["Remove watermark & all ads", "4K \xB7 60fps export", "Glow, gradient + image backgrounds", "Unlimited auto-captions + styles", "All 16 filters & Adjust+", "Batch export \xB7 Brand Kit presets"],
    r = [{
      k: "month",
      t: "Monthly",
      p: "$4.99",
      s: "/mo"
    }, {
      k: "year",
      t: "Yearly",
      p: "$19.99",
      s: "/yr",
      tag: "Save 67%"
    }, {
      k: "life",
      t: "Lifetime",
      p: "$29.99",
      s: "once"
    }];
  return <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "6px 20px 18px",
    overflowY: "auto"
  }}><div style={{
      display: "flex",
      justifyContent: "flex-end"
    }}><button onClick={() => e("editor")} style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 6
      }}><X size={20} color={d.muted} /></button></div><div style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 6
    }}><Crown size={22} color={d.volt} /><div style={{
        fontFamily: L.sans,
        fontWeight: 800,
        fontSize: 22,
        color: d.bone
      }}>{"Reelfit "}<span style={{
          color: d.volt
        }}>{"Pro"}</span></div></div><div style={{
      fontFamily: L.serif,
      fontStyle: "italic",
      fontSize: 14,
      color: d.muted,
      marginBottom: 18
    }}>{"Everything unlocked. No limits."}</div><div style={{
      background: d.card,
      borderRadius: 16,
      padding: "14px 16px",
      marginBottom: 18,
      border: `1px solid ${d.line}`
    }}>{o.map(l => <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "5px 0"
      }} key={l}><div style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: d.voltDim,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto"
        }}><Check size={11} color={d.volt} /></div><span style={{
          fontFamily: L.sans,
          fontSize: 13.5,
          color: d.bone
        }}>{l}</span></div>)}</div><div style={{
      display: "flex",
      flexDirection: "column",
      gap: 9,
      marginBottom: 16
    }}>{r.map(l => <button onClick={() => a(l.k)} style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: t === l.k ? d.voltDim : d.card,
        border: `1.5px solid ${t === l.k ? d.volt : d.line}`,
        borderRadius: 14,
        padding: "13px 16px",
        cursor: "pointer"
      }} key={l.k}><div style={{
          display: "flex",
          alignItems: "center",
          gap: 10
        }}><div style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            border: `2px solid ${t === l.k ? d.volt : d.line2}`,
            background: t === l.k ? d.volt : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>{t === l.k && <Check size={10} color="#fff" />}</div><span style={{
            fontFamily: L.sans,
            fontWeight: 700,
            fontSize: 14,
            color: d.bone
          }}>{l.t}</span>{l.tag && <span style={{
            fontFamily: L.mono,
            fontSize: 9,
            color: "#fff",
            background: d.volt,
            padding: "2px 6px",
            borderRadius: 6
          }}>{l.tag}</span>}</div><div style={{
          fontFamily: L.sans,
          color: d.bone
        }}><span style={{
            fontWeight: 800,
            fontSize: 15
          }}>{l.p}</span><span style={{
            fontSize: 11,
            color: d.muted
          }}>{" "}{l.s}</span></div></button>)}</div><button onClick={() => e("editor")} style={{
      width: "100%",
      background: `linear-gradient(135deg, ${d.volt}, #4A24C4)`,
      border: "none",
      borderRadius: 14,
      padding: 15,
      fontFamily: L.sans,
      fontWeight: 800,
      fontSize: 15,
      color: "#fff",
      cursor: "pointer",
      marginBottom: 10
    }}>{"Continue"}</button><div style={{
      textAlign: "center"
    }}><ByLine dim={!0} /></div></div>;
}
function About({
  go: e
}) {
  let t = [{
    I: Instagram,
    l: "Instagram",
    h: "@purstech"
  }, {
    I: Youtube,
    l: "YouTube",
    h: "PursTech"
  }, {
    I: Globe,
    l: "Website",
    h: "purstech.com"
  }];
  return <><TopBar title="About" onBack={() => e("home")} /><div style={{
      flex: 1,
      overflowY: "auto",
      padding: "8px 20px 20px"
    }}><div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "14px 0 22px"
      }}><img src={ps} alt="Reelfit" style={{
          width: 78,
          display: "block",
          marginBottom: 12,
          filter: `drop-shadow(0 12px 26px ${d.voltDim})`
        }} /><img src={Ic} alt="Reelfit" style={{
          width: 118,
          display: "block"
        }} /><div style={{
          marginTop: 7
        }}><ByLine /></div><div style={{
          fontFamily: L.serif,
          fontStyle: "italic",
          fontSize: 13.5,
          color: d.muted,
          marginTop: 12,
          textAlign: "center",
          lineHeight: 1.4
        }}>{"A PursTech app. Built for creators"}<br />{"who post everywhere."}</div></div><div style={{
        fontFamily: L.sans,
        fontWeight: 700,
        fontSize: 11,
        color: d.muted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 9
      }}>{"Follow PursTech"}</div><div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 20
      }}>{t.map(({
          I: a,
          l: o,
          h: r
        }) => <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: d.card,
          border: `1px solid ${d.line}`,
          borderRadius: 12,
          padding: "12px 14px"
        }} key={o}><a size={18} color={d.volt} /><div style={{
            flex: 1
          }}><div style={{
              fontFamily: L.sans,
              fontWeight: 700,
              fontSize: 13,
              color: d.bone
            }}>{o}</div><div style={{
              fontFamily: L.sans,
              fontSize: 11,
              color: d.muted
            }}>{r}</div></div></div>)}</div><div style={{
        background: `linear-gradient(135deg, ${d.eclipse2}, ${d.card})`,
        border: `1px solid ${d.volt}`,
        borderRadius: 16,
        padding: 16
      }}><div style={{
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 14,
          color: d.bone,
          marginBottom: 4
        }}>{"50 free tools on purstech.com"}</div><div style={{
          fontFamily: L.sans,
          fontSize: 12,
          color: d.muted,
          marginBottom: 12
        }}>{"Compress, convert, edit — right in your browser."}</div><button style={{
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 12.5,
          color: "#fff",
          background: d.volt,
          border: "none",
          padding: "9px 16px",
          borderRadius: 10,
          cursor: "pointer"
        }}>{"Explore tools →"}</button></div><div style={{
        textAlign: "center",
        marginTop: 20,
        fontFamily: L.mono,
        fontSize: 9.5,
        color: "rgba(139,135,152,0.6)"
      }}>{"Reelfit v0.7.7 · M6b · © PursTech 2026"}</div></div><BottomNav nav="about" go={e} /></>;
}
function TopBar({
  title: e,
  onBack: t,
  right: a
}) {
  return <div style={{
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    flex: "0 0 auto",
    borderBottom: `1px solid ${d.line}`
  }}><button onClick={t} style={{
      display: "flex",
      alignItems: "center",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: d.bone,
      padding: 4
    }}><ChevronLeft size={22} /></button><div style={{
      fontFamily: L.sans,
      fontWeight: 800,
      fontSize: 15,
      color: d.bone
    }}>{e}</div><div style={{
      minWidth: 30,
      display: "flex",
      justifyContent: "flex-end"
    }}>{a}</div></div>;
}
function BottomNav({
  nav: e,
  go: t
}) {
  let a = [{
    k: "home",
    I: Home,
    l: "Home"
  }, {
    k: "paywall",
    I: Crown,
    l: "Pro"
  }, {
    k: "about",
    I: Info,
    l: "About"
  }];
  return <div style={{
    height: 60,
    display: "flex",
    borderTop: `1px solid ${d.line}`,
    background: d.eclipse,
    flex: "0 0 auto"
  }}>{a.map(({
      k: o,
      I: r,
      l
    }) => {
      let n = e === o;
      return <button onClick={() => t(o)} style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        background: "none",
        border: "none",
        cursor: "pointer"
      }} key={o}><r size={20} color={n ? d.volt : d.muted} /><span style={{
          fontFamily: L.sans,
          fontSize: 10,
          fontWeight: n ? 700 : 500,
          color: n ? d.volt : d.muted
        }}>{l}</span></button>;
    })}</div>;
}
var ps = "data:image/png;base64,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",
  Ic = "data:image/png;base64,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",
  Ig = "data:image/png;base64,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";
function Splash() {
  return <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(180deg, #8864FC 0%, #6A4BD5 12%, #35206E 25%, #0B0620 40%, #0A0A14 45%)"
  }}><div style={{
      flex: 1
    }} /><img src={ps} alt="Reelfit" style={{
      width: 96,
      display: "block"
    }} /><img src={Ic} alt="Reelfit" style={{
      width: 148,
      display: "block",
      marginTop: 24
    }} /><div style={{
      flex: 1.3
    }} /><div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 7,
      paddingBottom: 30
    }}><span style={{
        fontFamily: L.sans,
        fontSize: 9,
        color: "#8f88a6"
      }}>{"Powered by:"}</span><img src={Ig} alt="PursTech" style={{
        width: 92,
        display: "block"
      }} /></div></div>;
}
function App() {
  let [e, t] = useState("splash"),
    [a, o] = useState(!1),
    r = useRef(null),
    l = useRef(null),
    n = useRef(C => {
      l.current = C;
    }),
    s = useRef(0),
    [i, f] = useState(!1),
    g = useRef({});
  useEffect(() => {
    let C = null,
      N = !1,
      j = setTimeout(() => {
        try {
          let z = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
          if (!z || !z.addListener) return;
          let U = () => {
              try {
                let b = g.current || {};
                if (b.gate) {
                  b.setGate && b.setGate(null);
                  return;
                }
                if (b.screen === "editor" && l.current && l.current() || b.screen === "exporting" || b.screen === "splash" || b.screen === "onboarding") return;
                if (b.screen === "success" || b.screen === "editor" || b.screen === "presets" || b.screen === "paywall" || b.screen === "about") {
                  b.setScreen && b.setScreen("home");
                  return;
                }
                if (Date.now() - s.current < 2e3) {
                  z.exitApp && z.exitApp();
                  return;
                }
                s.current = Date.now(), f(!0), setTimeout(() => f(!1), 2e3);
              } catch (b) {}
            },
            $ = z.addListener("backButton", U);
          $ && typeof $.then == "function" ? $.then(b => {
            N && b && b.remove ? b.remove() : C = b;
          }).catch(() => {}) : C = $;
        } catch (z) {}
      }, 0);
    return () => {
      N = !0, clearTimeout(j);
      try {
        C && C.remove && C.remove();
      } catch (z) {}
    };
  }, []);
  let [h, x] = useState("9:16"),
    [I, S] = useState({
      pct: 0,
      result: null
    }),
    A = useRef(!1),
    [M, p] = useState(null),
    c = async C => {
      let N = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport;
      if (!N) {
        C();
        return;
      }
      try {
        let te = await N.pick();
        p({
          ...te,
          src: window.Capacitor.convertFileSrc(te.path)
        }), C();
      } catch (te) {}
    },
    [m, y] = useState(null),
    [F, w] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("rf_recents") || "[]");
      } catch (C) {
        return [];
      }
    }),
    B = (C, N) => {
      try {
        let j = [{
          id: Date.now(),
          ratio: C.ratio,
          when: new Date().toLocaleDateString(void 0, {
            month: "short",
            day: "numeric"
          }),
          thumb: M && M.thumb || null,
          path: M && M.path,
          durationMs: M && M.durationMs,
          width: M && M.width,
          height: M && M.height,
          saved: N && N.saved,
          uri: N && N.uri
        }, ...F].slice(0, 6);
        w(j), localStorage.setItem("rf_recents", JSON.stringify(j));
      } catch (te) {}
    },
    T = C => {
      C.path && p({
        path: C.path,
        src: window.Capacitor && window.Capacitor.convertFileSrc ? window.Capacitor.convertFileSrc(C.path) : C.path,
        durationMs: C.durationMs,
        width: C.width,
        height: C.height,
        thumb: C.thumb
      }), x(C.ratio || "9:16"), t("editor");
    },
    q = C => p(N => N && {
      ...N,
      thumb: C
    }),
    E = C => {
      let N = [],
        te = Ol.find(j => j.k === C.filter);
      if (te && te.pro && N.push(te.l + " filter"), C.bgType === "glow" && N.push("Glow background"), C.bgType === "image" && N.push("Image background"), N.length && !localStorage.getItem("rf_pro")) {
        y({
          o: C,
          proBits: N
        });
        return;
      }
      oe(C);
    },
    oe = async C => {
      let N = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ReelfitExport;
      if (S({
        pct: 0,
        result: null
      }), t("exporting"), !N) return;
      let te = {
          blur: "blur",
          glow: "blur",
          image: "image",
          black: "color",
          white: "color",
          color: "color"
        },
        j = C.fill ? "fill" : te[C.bgType] || "blur";
      j === "image" && !C.bgImagePath && (j = "blur");
      let z = C.bgType === "black" ? "#000000" : C.bgType === "white" ? "#FFFFFF" : C.bgColor,
        U = Math.max(0, Math.min(100, Math.round((C.blurAmt - 5) * (100 / 35))));
      try {
        A.current || (await N.addListener("exportProgress", b => S(ue => ({
          ...ue,
          pct: Math.round(b.progress || 0)
        }))), A.current = !0);
        let $;
        if (M && M.path) {
          let b = {
            src: M.path,
            aspect: C.ratio,
            mode: j,
            blur: U,
            bgColor: z,
            filter: C.filter,
            adjB: C.adj.b,
            adjC: C.adj.c,
            adjS: C.adj.s,
            speed: C.speed || 1,
            volume: C.vol == null ? 100 : C.vol,
            borderFrac: (C.border || 0) / 244,
            radiusFrac: (C.radius || 0) / 244,
            borderColor: C.borderColor || "#FFFFFF"
          };
          if (j === "image" && (b.bgImage = C.bgImagePath), C.text && C.text.value) {
            let ue = Wt[C.text.style] || Wt.Clean,
              Lt = C.text.pos || {
                x: 0.5,
                y: (1 - ue.posY) / 2
              };
            b.text = {
              value: C.text.value,
              color: ue.color,
              sizeFrac: 0.045 * ((C.text.scale || 100) / 100),
              posX: Lt.x,
              posY: 1 - 2 * Lt.y
            };
          }
          M.durationMs > 0 && (C.trim[0] > 0 || C.trim[1] < 100) && (b.trimStartMs = Math.round(C.trim[0] / 100 * M.durationMs), b.trimEndMs = Math.round(C.trim[1] / 100 * M.durationMs)), $ = await N.export(b);
        } else $ = await N.pickAndExport({
          aspect: C.ratio,
          mode: "blur",
          blur: U
        });
        S({
          pct: 100,
          result: $
        }), B(C, $), setTimeout(() => t("success"), 350);
      } catch ($) {
        t("editor"), alert("Export cancelled or failed: " + ($ && $.message || $));
      }
    };
  useEffect(() => {
    if (e === "splash") {
      let C = setTimeout(() => t(localStorage.getItem("rf_ob") ? "home" : "onboarding"), 1900);
      return () => clearTimeout(C);
    }
  }, [e]);
  let K = C => t(C),
    Te = () => {
      localStorage.setItem("rf_ob", "1"), t("home"), o(!0);
    };
  g.current = {
    screen: e,
    gate: m,
    setGate: y,
    setScreen: t
  };
  let xt = () => {
    switch (e) {
      case "splash":
        return <Splash />;
      case "onboarding":
        return <Onboarding done={Te} />;
      case "home":
        return <HomeScreen go={C => C === "import" ? c(() => t("presets")) : K(C)} coach={a} endCoach={() => o(!1)} screenRef={r} recents={F} resume={T} />;
      case "presets":
        return <Presets go={K} setFmt={x} ensureMedia={C => M ? C() : c(C)} />;
      case "editor":
        return <Editor go={K} initialRatio={h} onExport={E} media={M} onThumb={q} registerBack={n.current} />;
      case "exporting":
        return <Exporting go={K} pct={I.pct} />;
      case "success":
        return <Success go={K} result={I.result} />;
      case "paywall":
        return <Paywall go={K} />;
      case "about":
        return <About go={K} />;
      default:
        return <HomeScreen go={K} coach={!1} endCoach={() => {}} screenRef={r} />;
    }
  };
  return <div ref={r} style={{
    position: "fixed",
    inset: 0,
    background: d.eclipse,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: L.sans
  }}>{xt()}{i && <div style={{
      position: "absolute",
      left: "50%",
      bottom: 84,
      transform: "translateX(-50%)",
      background: "rgba(20,20,29,0.96)",
      border: "1px solid rgba(139,135,152,0.3)",
      borderRadius: 20,
      padding: "10px 18px",
      fontFamily: L.sans,
      fontSize: 12.5,
      fontWeight: 600,
      color: d.bone,
      zIndex: 70,
      whiteSpace: "nowrap",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
    }}>{"Press back again to exit"}</div>}{m && <div style={{
      position: "absolute",
      inset: 0,
      background: "rgba(5,5,12,0.78)",
      display: "flex",
      alignItems: "flex-end",
      zIndex: 50
    }} onClick={() => y(null)}><div onClick={C => C.stopPropagation()} style={{
        width: "100%",
        background: "#12121D",
        borderRadius: "22px 22px 0 0",
        padding: "20px 20px 26px",
        borderTop: "1px solid rgba(139,135,152,0.25)"
      }}><div style={{
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 17,
          color: "#F5F2EC",
          marginBottom: 6
        }}>{"This export uses Pro ✨"}</div><div style={{
          fontFamily: L.sans,
          fontSize: 12.5,
          color: "#8B8798",
          marginBottom: 14
        }}>{m.proBits.join(" \xB7 ")}</div><button onClick={() => {
          y(null), t("paywall");
        }} style={{
          width: "100%",
          background: "linear-gradient(135deg,#6C3AFF,#4A24C4)",
          border: "none",
          borderRadius: 13,
          padding: 14,
          fontFamily: L.sans,
          fontWeight: 800,
          fontSize: 14.5,
          color: "#fff",
          cursor: "pointer",
          marginBottom: 9
        }}>{"Unlock Pro — keep this look"}</button><button onClick={() => {
          let C = {
              ...m.o
            },
            N = Ol.find(te => te.k === C.filter);
          N && N.pro && (C.filter = "none"), (C.bgType === "glow" || C.bgType === "image") && (C.bgType = "blur"), y(null), oe(C);
        }} style={{
          width: "100%",
          background: "none",
          border: "1px solid rgba(139,135,152,0.35)",
          borderRadius: 13,
          padding: 12,
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 13,
          color: "#F5F2EC",
          cursor: "pointer",
          marginBottom: 6
        }}>{"Export free version"}</button><button onClick={() => y(null)} style={{
          width: "100%",
          background: "none",
          border: "none",
          fontFamily: L.sans,
          fontWeight: 700,
          fontSize: 12,
          color: "#8B8798",
          cursor: "pointer",
          padding: 6
        }}>{"Keep editing"}</button></div></div>}</div>;
}
createRoot(document.getElementById("root")).render(<App />);