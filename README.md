# CommandCenter

CoilShield / ICCP companion apps: **Electron desktop** (SSH, port-forward, `iccp` over SSH) and **design-mobile** (Vite + React design canvas + ArtSky).

## Launch on macOS (one double-click)

In Finder, open this repo and double-click:

- **`Launch Command Center.command`** — installs `desktop/` deps if needed, then runs the Electron app (`npm run dev`).
- **`Launch Design Canvas.command`** — same for the Vite design canvas in `design-mobile/`.

If macOS warns the script is from an unidentified developer, **right-click → Open** once, then confirm.

Requires **Node.js** / `npm` on your PATH (or **nvm** in the default location at `~/.nvm`).
