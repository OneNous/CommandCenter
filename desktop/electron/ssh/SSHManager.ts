import { Client } from 'ssh2'
import type { SshConnectParams } from '../types'

export class SSHManager {
  private client: Client | null = null
  private connected = false
  /** Must stay attached for the Client lifetime — ssh2 emits `error` from the socket `data` path (e.g. channel open failure) and Node crashes if nothing listens. */
  private logSshError: ((err: Error) => void) | null = null

  get isConnected() {
    return this.connected
  }

  async connect(params: SshConnectParams): Promise<void> {
    await this.disconnect()

    const client = new Client()
    this.client = client

    const logSshError = (err: Error) => {
      console.error('[ssh2]', err.message)
    }
    this.logSshError = logSshError
    client.on('error', logSshError)

    const port = params.port ?? 22
    const readyTimeout = params.readyTimeoutMs ?? 20_000

    await new Promise<void>((resolve, reject) => {
      let settled = false

      const cleanupHandshake = () => {
        client.removeListener('ready', onReady)
        client.removeListener('error', onHandshakeError)
        client.removeListener('close', onHandshakeClose)
      }

      const onHandshakeError = (err: Error) => {
        if (settled) return
        settled = true
        this.connected = false
        cleanupHandshake()
        reject(err)
      }

      const onHandshakeClose = () => {
        this.connected = false
        if (settled) return
        settled = true
        cleanupHandshake()
        reject(new Error('SSH connection closed before ready'))
      }

      const onReady = () => {
        if (settled) return
        settled = true
        this.connected = true
        cleanupHandshake()
        resolve()
      }

      client.on('ready', onReady)
      client.on('error', onHandshakeError)
      client.on('close', onHandshakeClose)

      const common = {
        host: params.host,
        port,
        username: params.username,
        readyTimeout
      }

      if (params.auth.type === 'password') {
        client.connect({ ...common, password: params.auth.password })
      } else {
        client.connect({
          ...common,
          privateKey: params.auth.privateKey,
          passphrase: params.auth.passphrase
        })
      }
    })
  }

  getClientOrThrow(): Client {
    if (!this.client || !this.connected) {
      throw new Error('SSH is not connected')
    }
    return this.client
  }

  async disconnect(): Promise<void> {
    if (!this.client) return
    const client = this.client
    this.client = null
    this.connected = false
    if (this.logSshError) {
      client.removeListener('error', this.logSshError)
      this.logSshError = null
    }
    client.end()
  }
}
