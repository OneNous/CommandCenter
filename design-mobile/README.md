# CoilShield ICCP — mobile

Production UI is a **full-screen React app** (login → Live / Trends / Settings). The **design canvas** (multi-artboard + tweaks) is still available for visual iteration.

## Run in the browser (app shell)

```bash
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). This is the same UI that ships inside the native wrapper.

### What works in the app shell

- **Sign in** — email + password validation, short “network” delay, session persisted (localStorage).
- **Pair a controller** — host + port → `GET /api/meta` check → optional `GET /api/live`; then opens the main tabs. Stays on **simulator** if `/api/live` fails.
- **Live** — ~1s **simulated telemetry** (or real HTTP poll when paired): drifting mA, totals, reference, rolling sparkline buffers; **↻ refresh**; **fault clear** on channels; **dismiss** health alerts; **tap a channel** for a bottom sheet with mini trend.
- **Trends** — range / mA·Ω toggles, legend lines (toggle fixed), **export** buttons (JSON download + toast), **tap a session** to expand a detail line.
- **Settings** — toggles (notifications / auto-clear / haptics) with toasts; **connection** line reflects pair URL or simulator; **Sign out**; **Documentation** opens a browser tab.
- **Toasts** — top stack for exports, faults, pairing, etc.

## Run the design canvas

```bash
npm run dev:design
```

## Build for iOS / Android (Capacitor)

1. **One-time native projects** (after clone):

   ```bash
   npm install
   npm run build
   npx cap add ios
   npx cap add android
   ```

2. **After web changes**:

   ```bash
   npm run build:mobile
   ```

3. **Open Xcode / Android Studio**:

   ```bash
   npm run cap:ios
   npm run cap:android
   ```

`vite.config.js` uses `base: './'` so bundled assets load from the Capacitor WebView. `viewport-fit=cover` and safe-area env vars support edge-to-edge layouts on notched devices.

## Auth & data

Sign-in / “Pair a controller” currently advance to the main tabs as **stubs** — wire your ICCP session, SSH tunnel, or API client here next.
