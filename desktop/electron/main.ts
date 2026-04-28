import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { SSHManager } from './ssh/SSHManager'
import { PortForward } from './ssh/PortForward'
import { appStore } from './store'
import type { ConnectionProfile, ExecChunk, ExecRequest, ExecResult, SshConnectParams, TunnelParams } from './types'

const ssh = new SSHManager()
const tunnel = new PortForward()
/** Last successful SSH connect — used to prepend `remoteEnvLines` to exec requests from the renderer. */
let activeProfile: ConnectionProfile | null = null

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 800,
    backgroundColor: '#0b0f14',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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

app.whenReady().then(() => {
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
})

ipcMain.handle('profiles:get', () => ({
  profiles: appStore.get('profiles') as ConnectionProfile[],
  activeProfileId: appStore.get('activeProfileId'),
}))

ipcMain.handle('profiles:set', (_e, payload: { profiles: ConnectionProfile[]; activeProfileId: string | null }) => {
  appStore.set('profiles', payload.profiles)
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

function wrapRemoteCommand(command: string, profile: ConnectionProfile | null): string {
  const lines = profile?.remoteEnvLines?.map((l) => l.trim()).filter(Boolean) ?? []
  if (!lines.length) return command
  const exports = lines.map((l) => (l.startsWith('export ') ? l : `export ${l}`))
  const inner = [...exports, command].join(' && ')
  return `bash -lc ${JSON.stringify(inner)}`
}

ipcMain.handle('ssh:exec', async (evt, req: ExecRequest) => {
  const client = ssh.getClientOrThrow()
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const command = req.wrapEnv !== false ? wrapRemoteCommand(req.command, activeProfile) : req.command

  let stdout = ''
  let stderr = ''
  const result: ExecResult = await new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
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

