import { Client } from 'ssh2'
import type { SshConnectParams } from '../types'

export class SSHManager {
  private client: Client | null = null
  private connected = false

  get isConnected() {
    return this.connected
  }

  async connect(params: SshConnectParams): Promise<void> {
    await this.disconnect()

    const client = new Client()
    this.client = client

    const port = params.port ?? 22
    const readyTimeout = params.readyTimeoutMs ?? 20_000

    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        this.connected = true
        cleanup()
        resolve()
      }
      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }
      const onClose = () => {
        this.connected = false
      }
      const cleanup = () => {
        client.off('ready', onReady)
        client.off('error', onError)
        client.off('close', onClose)
      }

      client.on('ready', onReady)
      client.on('error', onError)
      client.on('close', onClose)

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
    client.end()
  }
}

