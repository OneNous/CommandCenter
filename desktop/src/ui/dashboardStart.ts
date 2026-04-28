import type { ConnectionProfile } from '../../electron/types'

/** Escape a string for safe inclusion inside single quotes in POSIX shell. */
function escapeForSingleQuotedShell(s: string): string {
  return s.replace(/'/g, "'\\''")
}

/**
 * Default remote command: background `iccp dashboard` matching the profile forward target.
 * Output is appended to `/tmp/iccp-desktop-dashboard.log` on the Pi.
 */
export function buildDefaultDashboardStartCommand(p: ConnectionProfile): string {
  const host = escapeForSingleQuotedShell((p.remoteDashboardHost ?? '127.0.0.1').trim())
  const port =
    typeof p.remoteDashboardPort === 'number' && p.remoteDashboardPort > 0 ? p.remoteDashboardPort : 8080
  return (
    `if command -v iccp >/dev/null 2>&1; then ` +
    `nohup iccp dashboard --host '${host}' --port ${port} >>/tmp/iccp-desktop-dashboard.log 2>&1 & ` +
    `echo iccp_dashboard_started; ` +
    `else echo "iccp_not_in_PATH" >&2; fi`
  )
}
