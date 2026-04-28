import net from 'node:net'
import type { Client } from 'ssh2'
import type { TunnelParams } from '../types'

export class PortForward {
  private server: net.Server | null = null
  private localPort: number | null = null

  getLocalPortOrThrow(): number {
    if (!this.localPort) throw new Error('Tunnel is not started')
    return this.localPort
  }

  async start(client: Client, params: TunnelParams): Promise<number> {
    await this.stop()

    const localHost = params.localHost ?? '127.0.0.1'
    const remoteHost = params.remoteHost
    const remotePort = params.remotePort

    const server = net.createServer((socket) => {
      client.forwardOut(
        socket.remoteAddress ?? '127.0.0.1',
        socket.remotePort ?? 0,
        remoteHost,
        remotePort,
        (err, stream) => {
          if (err) {
            socket.destroy(err)
            return
          }
          socket.pipe(stream)
          stream.pipe(socket)
          stream.on('close', () => socket.destroy())
          socket.on('close', () => stream.end())
        }
      )
    })

    this.server = server

    const localPort = await new Promise<number>((resolve, reject) => {
      server.on('error', reject)
      server.listen(params.localPort ?? 0, localHost, () => {
        const address = server.address()
        if (typeof address === 'string' || address == null) {
          reject(new Error('Unexpected server address'))
          return
        }
        resolve(address.port)
      })
    })

    this.localPort = localPort
    return localPort
  }

  async stop(): Promise<void> {
    this.localPort = null
    const server = this.server
    this.server = null
    if (!server) return
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

