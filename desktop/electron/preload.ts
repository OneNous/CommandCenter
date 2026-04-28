import { contextBridge, ipcRenderer } from 'electron'
import type {
  ConnectionProfile,
  ExecChunk,
  ExecRequest,
  ExecResult,
  SshConnectParams,
  TunnelParams,
} from './types'

type ExecChunkEvent = { requestId: string; chunk: ExecChunk }

const api = {
  profilesGet: () =>
    ipcRenderer.invoke('profiles:get') as Promise<{
      profiles: ConnectionProfile[]
      activeProfileId: string | null
    }>,
  profilesSet: (payload: { profiles: ConnectionProfile[]; activeProfileId: string | null }) =>
    ipcRenderer.invoke('profiles:set', payload) as Promise<{ ok: true }>,
  sessionSetProfile: (profile: ConnectionProfile | null) =>
    ipcRenderer.invoke('session:setProfile', profile) as Promise<{ ok: true }>,

  sshConnect: (params: SshConnectParams) => ipcRenderer.invoke('ssh:connect', params) as Promise<{ ok: true }>,
  sshDisconnect: () => ipcRenderer.invoke('ssh:disconnect') as Promise<{ ok: true }>,
  tunnelStart: (params: TunnelParams) =>
    ipcRenderer.invoke('tunnel:start', params) as Promise<{ localPort: number }>,
  tunnelStop: () => ipcRenderer.invoke('tunnel:stop') as Promise<{ ok: true }>,
  sshExec: (req: ExecRequest) =>
    ipcRenderer.invoke('ssh:exec', req) as Promise<{ requestId: string; result: ExecResult }>,
  onExecChunk: (handler: (evt: ExecChunkEvent) => void) => {
    const listener = (_: unknown, payload: ExecChunkEvent) => handler(payload)
    ipcRenderer.on('ssh:exec:chunk', listener)
    return () => ipcRenderer.off('ssh:exec:chunk', listener)
  },
}

contextBridge.exposeInMainWorld('iccp', api)

export type IccpBridge = typeof api

