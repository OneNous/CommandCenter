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
5. **`GET .../api/live`** — poll at roughly `sample_interval_s` (this renderer clamps to about **400–5000 ms**) **whenever the tunnel is up**, not only while the Live tab is focused, so telemetry does not look “stale” after switching tabs. Treat **`feed_trust_channel_metrics`** / **`feed_ok`** as false → show a non-blocking banner (stale or incomplete telemetry).

Further routes (`/api/history`, `/api/stats`, `/api/daily`, `/api/sessions`, `/api/diagnostic`, `/api/export`, …) use the same `makeApiBase(localPort)` pattern; see the ICCP doc.

## Pi console (SSH `exec`)

The desktop **Connect** flow is still: SSH session + **direct-tcpip** forward of the dashboard port to `127.0.0.1:<localPort>` on the workstation (same net effect as `ssh -L`). That path is **read-only HTTP** from ICCP’s contract.

**Control and diagnostics** use the same SSH session via **`ssh:exec`**: the UI’s **Pi console** tab sends a remote command. When **wrap env / login shell** is enabled (default), the main process wraps it as **`bash -lc '…'`** (with optional profile `remoteEnvLines` as leading `export` lines) so **`iccp`** and other login-PATH tools work like in Terminal; when disabled, the string is passed raw to `exec` (no `bash -lc`). **`sudo` that prompts for a password will not work** from this path unless you configure non-interactive sudo on the Pi.

### “Stale” Live JSON

`/api/live` returns what the **dashboard process** reads from disk (`latest.json` under the resolved log dir). It is **not** your Mac reading old copies. If `feed_age_s` / `json_payload_age_s` stay high while the system should be updating, typical causes are: **controller process not running**, **dashboard and controller using different `COILSHIELD_LOG_DIR`**, or the controller stopped writing. Confirm paths in **`/api/meta`** and on the Pi use normal diagnostics (`uptime`, `ps`, `systemctl` / `journalctl` as appropriate for your install).

### Pi troubleshooting notes (systemd)

- **Controller starts then immediately stops / restarts**: check `journalctl -u iccp` for `ExecStartPre=` failures. A missing pre-hook script (common when operators copy a unit file but not the script it references) will prevent `iccp start` from running at all.
- **Service is `active (running)` but `latest.json` never updates**: confirm you are looking at the same `latest_json` path reported by `GET /api/meta`, then `stat` it directly on the Pi. If the controller is running and logging `[tick]` but `latest.json` mtime is old, the controller and dashboard are almost certainly pointed at different log dirs.
- **`iccp start` complains “systemd unit 'iccp' is already active”**: this means you are launching a *foreground* controller while the systemd service is also active (or `iccp` is being run as the service `ExecStart` but is still doing the foreground safety check). Use one controller owner: `sudo systemctl start iccp` (service), or `iccp start --force` only if you know the service is stopped.
- **Commissioning stops live telemetry**: `iccp commission` is allowed to stop `iccp` via systemd sync so it can own PWM/GPIO exclusively. Expect the dashboard to look “stuck” during that window; restart `iccp` when commissioning is complete.

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
