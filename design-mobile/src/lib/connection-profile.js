/**
 * Same shape as `desktop/electron/types.ts` ConnectionProfile (+ optional mobile HTTP URL).
 * SSH is not executed in the mobile WebView; use `httpApiBase` after port-forward, or CoilShield Desktop.
 *
 * @typedef {Object} ConnectionProfile
 * @property {string} id
 * @property {string} name
 * @property {string} host
 * @property {number} [port]
 * @property {string} username
 * @property {{type:'password',password:string}|{type:'privateKey',privateKey:string,passphrase?:string}} auth
 * @property {string} remoteDashboardHost
 * @property {number} remoteDashboardPort
 * @property {string[]} [remoteEnvLines]
 * @property {string} [httpApiBase]
 */

/** Same starter profile as desktop `App.tsx` defaultProfile() (typical Pi / LAN setup). */
export function createDefaultProfile() {
  return {
    id: crypto.randomUUID(),
    name: 'Pi @ 192.168.1.137',
    host: '192.168.1.137',
    port: 22,
    username: 'onenous',
    auth: { type: 'password', password: '' },
    remoteDashboardHost: '127.0.0.1',
    remoteDashboardPort: 8080,
    remoteEnvLines: [],
    /** When set, mobile uses this base for `/api/*` (same as desktop after tunnel). */
    httpApiBase: '',
  }
}

/**
 * @param {unknown} p
 * @returns {ConnectionProfile}
 */
export function normalizeProfile(p) {
  if (!p || typeof p !== 'object') return createDefaultProfile()
  const o = /** @type {Record<string, unknown>} */ (p)
  const auth = o.auth
  let normalizedAuth =
    auth && typeof auth === 'object' && /** @type {{type?:string}} */ (auth).type === 'privateKey'
      ? {
          type: 'privateKey',
          privateKey: String(/** @type {{privateKey?:string}} */ (auth).privateKey ?? ''),
          passphrase: String(/** @type {{passphrase?:string}} */ (auth).passphrase ?? ''),
        }
      : { type: 'password', password: String(/** @type {{password?:string}} */ (auth)?.password ?? '') }

  const rdPort =
    typeof o.remoteDashboardPort === 'number'
      ? o.remoteDashboardPort
      : typeof o.remotePort === 'number'
        ? o.remotePort
        : 8080

  return {
    id: String(o.id ?? crypto.randomUUID()),
    name: String(o.name ?? 'Profile'),
    host: String(o.host ?? ''),
    port: typeof o.port === 'number' ? o.port : 22,
    username: String(o.username ?? ''),
    auth: normalizedAuth,
    remoteDashboardHost: String(o.remoteDashboardHost ?? '127.0.0.1'),
    remoteDashboardPort: rdPort,
    remoteEnvLines: Array.isArray(o.remoteEnvLines) ? o.remoteEnvLines.map(String) : [],
    httpApiBase: typeof o.httpApiBase === 'string' ? o.httpApiBase : '',
  }
}

/**
 * @param {import('./connection-profile').ConnectionProfile} profile
 * @param {number} [localForwardPort] suggested local port for ssh -L
 */
export function buildSshTunnelCommand(profile, localForwardPort = 9080) {
  const u = profile.username || 'pi'
  const h = profile.host || '<pi-host>'
  const p = profile.port ?? 22
  const rh = profile.remoteDashboardHost || '127.0.0.1'
  const rp = profile.remoteDashboardPort ?? 8080
  return `ssh -L ${localForwardPort}:${rh}:${rp} ${u}@${h} -p ${p}`
}

/**
 * @param {import('./connection-profile').ConnectionProfile} profile
 * @param {string} command e.g. `iccp live`
 */
export function buildRemoteExecShell(profile, command) {
  const lines = (profile.remoteEnvLines ?? []).map((l) => l.trim()).filter(Boolean)
  const exports = lines.map((l) => (l.startsWith('export ') ? l : `export ${l}`))
  const inner = [...exports, command].join(' && ')
  return `bash -lc ${JSON.stringify(inner)}`
}
