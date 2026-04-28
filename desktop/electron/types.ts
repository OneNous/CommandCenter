export type SshAuth =
  | { type: 'password'; password: string }
  | { type: 'privateKey'; privateKey: string; passphrase?: string }

export type SshConnectParams = {
  host: string
  port?: number
  username: string
  auth: SshAuth
  readyTimeoutMs?: number
}

export type TunnelParams = {
  remoteHost: string
  remotePort: number
  localHost?: string
  localPort?: number
}

export type ExecRequest = {
  command: string
  /** When true (default), prepend saved profile `remoteEnvLines` on the Pi before the command. */
  wrapEnv?: boolean
}

export type ExecChunk = {
  stream: 'stdout' | 'stderr'
  data: string
}

export type ExecResult = {
  code: number | null
  signal: string | null
  stdout: string
  stderr: string
}

/** Saved connection (password / key material stored locally — prefer OS keychain in a future revision). */
export type ConnectionProfile = {
  id: string
  name: string
  host: string
  port?: number
  username: string
  auth: SshAuth
  remoteDashboardHost: string
  /** Dashboard listen port on the Pi (forward target), e.g. 8080 for `iccp dashboard`. */
  remoteDashboardPort: number
  /**
   * When true (default), after SSH connects the app runs a remote command to start the dashboard
   * (`nohup iccp dashboard … &`) before opening the port-forward tunnel.
   */
  autoStartDashboard?: boolean
  /**
   * Optional shell command run on the Pi (login shell + `remoteEnvLines`) instead of the default
   * `iccp dashboard` launcher. Use when the dashboard is started via systemd or a custom script.
   */
  dashboardStartCommand?: string
  /** Optional `KEY=value` lines applied before remote `iccp` / `systemctl` commands. */
  remoteEnvLines?: string[]
}

