# Reelfit — Phase 0

Compliant social video formatter. A PursTech app.

- `www/` — the app shell (loads in the Android WebView)
- `resources/` — icon + splash sources (CI turns these into all Android sizes)
- `.github/workflows/` — CI: **Build APK** (test build), **Make Keystore** (one-time), **Release AAB** (Play upload)

The `android/` native project is **generated fresh in CI** on every build — never committed.
Full setup steps: see `Reelfit_Phase0_Playbook.md` (kept outside the repo).
