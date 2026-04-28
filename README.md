# CommandCenter

CoilShield / ICCP companion apps: **Electron desktop** (SSH, port-forward, `iccp` over SSH) and **design-mobile** (Vite + React — production **mobile app** plus optional **design canvas**; Capacitor iOS/Android).

## Desktop ↔ ICCP Pi

See **`desktop/INTEGRATION.md`** for the connect sequence (`sessionSetProfile` → SSH → tunnel → `/api/meta` → `/api/live`), Pi prerequisites, and field notes (dashboard bind, `sudo` over SSH).

From a terminal, first-time install in `desktop/`: `npm install --legacy-peer-deps` (resolves the current `electron-vite` / Vite peer range mismatch). **`Launch Command Center.command`** uses the same flags on first run.

## Launch on macOS (one double-click)

In Finder, open this repo and double-click:

- **`Launch Command Center.command`** — installs `desktop/` deps if needed, then runs the Electron app (`npm run dev`).
- **`Launch Mobile App.command`** — installs `design-mobile/` deps if needed, then runs the **app shell** (login + tabs) in the browser.
- **`Launch Design Canvas.command`** — runs the **design canvas** in `design-mobile/` (artboards + tweaks): `npm run dev:design`.

Details: **`design-mobile/README.md`**.

If macOS warns the script is from an unidentified developer, **right-click → Open** once, then confirm.

Requires **Node.js** / `npm` on your PATH (or **nvm** in the default location at `~/.nvm`).

If you see **`Error: EPERM: operation not permitted, uv_cwd`** when npm runs, the launchers (1) run npm from **`/tmp`** with **`--prefix`**, and (2) call the **real `npm` binary** (`nvm which npm` or `$(dirname $(which node))/npm`) instead of **nvm’s `npm` shell function**, which can still trigger `uv_cwd` under Desktop/Documents TCC. If problems persist, grant **Full Disk Access** to **Terminal** (System Settings → Privacy & Security → Full Disk Access).
