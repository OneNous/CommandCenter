import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import type { ClientChannel } from 'ssh2'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { SSHManager } from './ssh/SSHManager'
import { PortForward } from './ssh/PortForward'
import { appStore } from './store'
import type { ConnectionProfile, ExecChunk, ExecRequest, ExecResult, SshConnectParams, TunnelParams } from './types'

const ssh = new SSHManager()
const tunnel = new PortForward()
/** Last successful SSH connect — used to prepend `remoteEnvLines` to exec requests from the renderer. */
let activeProfile: ConnectionProfile | null = null

const APP_DISPLAY_NAME = 'ICCP Command Center'

/** Repo `desktop/resources/app-icon.png` — resolved from `out/main` after build. */
function resolveAppIconPath(): string | undefined {
  const png = join(__dirname, '../../resources/app-icon.png')
  if (existsSync(png)) return png
  return undefined
}

function createWindow() {
  const iconPath = resolveAppIconPath()
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined

  const win = new BrowserWindow({
    width: 1240,
    height: 800,
    title: APP_DISPLAY_NAME,
    backgroundColor: '#05070a',
    ...(icon && !icon.isEmpty() ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.setName(APP_DISPLAY_NAME)

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = resolveAppIconPath()
    if (iconPath) {
      const img = nativeImage.createFromPath(iconPath)
      if (!img.isEmpty()) app.dock.setIcon(img)
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  void tunnel.stop()
  void ssh.disconnect()
  activeProfile = null
})

function migrateProfile(raw: unknown): ConnectionProfile {
  const out = { ...(raw as Record<string, unknown>) }
  if (typeof out.remoteDashboardPort !== 'number' && typeof out.remotePort === 'number') {
    out.remoteDashboardPort = out.remotePort
  }
  delete out.remotePort
  return out as unknown as ConnectionProfile
}

ipcMain.handle('profiles:get', () => {
  const raw = appStore.get('profiles') as unknown[]
  const profiles = Array.isArray(raw) ? raw.map(migrateProfile) : []
  return {
    profiles,
    activeProfileId: appStore.get('activeProfileId'),
  }
})

ipcMain.handle('profiles:set', (_e, payload: { profiles: ConnectionProfile[]; activeProfileId: string | null }) => {
  const cleaned = payload.profiles.map((p) => migrateProfile(p as unknown))
  appStore.set('profiles', cleaned)
  appStore.set('activeProfileId', payload.activeProfileId)
  return { ok: true as const }
})

ipcMain.handle('session:setProfile', (_e, profile: ConnectionProfile | null) => {
  activeProfile = profile
  if (profile) appStore.set('activeProfileId', profile.id)
  return { ok: true as const }
})

ipcMain.handle('ssh:connect', async (_evt, params: SshConnectParams) => {
  await ssh.connect(params)
  return { ok: true }
})

ipcMain.handle('ssh:disconnect', async () => {
  await tunnel.stop()
  await ssh.disconnect()
  activeProfile = null
  return { ok: true }
})

ipcMain.handle('tunnel:start', async (_evt, params: TunnelParams) => {
  const client = ssh.getClientOrThrow()
  const localPort = await tunnel.start(client, params)
  return { localPort }
})

ipcMain.handle('tunnel:stop', async () => {
  await tunnel.stop()
  return { ok: true }
})

/**
 * Run on the Pi as `bash -lc …` so non-interactive SSH `exec` still sees the same PATH as a login shell
 * (`iccp` is often only on PATH after `.profile` / `.bashrc`). Optional profile `remoteEnvLines` are prepended as exports.
 */
function wrapRemoteCommand(command: string, profile: ConnectionProfile | null): string {
  const lines = profile?.remoteEnvLines?.map((l) => l.trim()).filter(Boolean) ?? []
  const exports = lines.map((l) => (l.startsWith('export ') ? l : `export ${l}`))
  const inner = exports.length > 0 ? [...exports, command].join(' && ') : command
  return `bash -lc ${JSON.stringify(inner)}`
}

ipcMain.handle('ssh:exec', async (evt, req: ExecRequest) => {
  const client = ssh.getClientOrThrow()
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const command = req.wrapEnv !== false ? wrapRemoteCommand(req.command, activeProfile) : req.command

  let stdout = ''
  let stderr = ''
  const result: ExecResult = await new Promise((resolve, reject) => {
    client.exec(command, (err: Error | undefined, stream: ClientChannel) => {
      if (err) return reject(err)

      stream.on('data', (buf: Buffer) => {
        const s = buf.toString('utf8')
        stdout += s
        const chunk: ExecChunk = { stream: 'stdout', data: s }
        evt.sender.send('ssh:exec:chunk', { requestId, chunk })
      })
      stream.stderr.on('data', (buf: Buffer) => {
        const s = buf.toString('utf8')
        stderr += s
        const chunk: ExecChunk = { stream: 'stderr', data: s }
        evt.sender.send('ssh:exec:chunk', { requestId, chunk })
      })
      stream.on('close', (code: number | null, signal: string | null) => {
        resolve({ code, signal, stdout, stderr })
      })
    })
  })

  return { requestId, result }
})

