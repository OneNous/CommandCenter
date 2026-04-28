# ICCP desktop ↔ Pi integration

Canonical HTTP contract and semantics live in the ICCP repo as **`docs/desktop-app-integration.md`**.

If **ICCP** and **ICCP-APP** are sibling folders on your machine (e.g. `Desktop/ICCP` and `Desktop/ICCP-APP`), open from this file’s directory:

`../../ICCP/docs/desktop-app-integration.md`

If you vendor-copy that doc into this repo, replace the above with a short relative link to the copy. On GitHub, use your org’s ICCP tree URL to the same path.

## Connect sequence (this app)

1. **`session:setProfile`** — `window.iccp.sessionSetProfile(profile)` so the main process can prepend `remoteEnvLines` to non-HTTP remote commands (`ssh:exec`).
2. **`ssh:connect`** — SSH session to the Pi.
3. **`tunnel:start`** — `{ remoteHost: profile.remoteDashboardHost, remotePort: profile.remoteDashboardPort }` (defaults: `127.0.0.1` and `8080`). The IPC field name `remotePort` is the SSH forward target port (same as dashboard port on the Pi). Returns `localPort` on the workstation.
4. **`GET http://127.0.0.1:<localPort>/api/meta`** — channel count, `sample_interval_s`, `package_version`, log paths; use to size the UI and choose poll cadence.
5. **`GET .../api/live`** — poll at roughly `sample_interval_s` (this renderer clamps to about **400–5000 ms**). Treat **`feed_trust_channel_metrics`** / **`feed_ok`** as false → show a non-blocking banner (stale or incomplete telemetry).

Further routes (`/api/history`, `/api/stats`, `/api/daily`, `/api/sessions`, `/api/diagnostic`, `/api/export`, …) use the same `makeApiBase(localPort)` pattern; see the ICCP doc.

## Minimum Pi prerequisites

- Controller running: `iccp start` (or `systemctl start iccp`).
- Dashboard serving JSON: `iccp dashboard` (default bind **`0.0.0.0:8080`**).
- **`COILSHIELD_LOG_DIR` / `ICCP_LOG_DIR`** (and optional `iccp dashboard --log-dir`) aligned with the controller so `latest.json` and SQLite paths match.

### Dashboard bind and SSH forward

Tunneling to **`127.0.0.1:<dashboard-port>`** on the Pi is correct for the default dashboard. If operators bind the dashboard with **`--host 127.0.0.1`**, LAN access disappears but **SSH local forward still works** — document that choice for the field team.

### `iccp` / `systemctl` over SSH

- Prefer explicit paths or `command -v iccp` for **non-login** shells.
- `sudo systemctl …` from this app is **non-interactive**; document **NOPASSWD** for required units or an interactive operator path.

## CORS

ICCP enables CORS on **`/api/*`**, so the Electron renderer can `fetch` the tunneled `http://127.0.0.1:<localPort>/api/...` without browser blocking.
