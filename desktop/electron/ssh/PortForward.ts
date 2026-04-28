import net from 'node:net'
import type { Client, ClientChannel } from 'ssh2'
import type { TunnelParams } from '../types'

/** Map ssh2 forwardOut failures to something operators can act on. */
export function mapForwardOutError(err: Error, remoteHost: string, remotePort: number): Error {
  const m = err.message || ''
  const refused =
    m.includes('Connection refused') ||
    m.includes('CHANNEL_OPEN_FAILURE') ||
    /open failure.*refused/i.test(m)
  if (refused) {
    return new Error(
      `Nothing is accepting connections on the Pi at ${remoteHost}:${remotePort} (connection refused). ` +
        'Start the dashboard API there, e.g. `iccp dashboard` (port 8080 by default), and match ' +
        '"Remote dashboard host" / port in your profile. Use 127.0.0.1 when the dashboard listens on the Pi loopback or 0.0.0.0.',
    )
  }
  return new Error(`SSH tunnel to ${remoteHost}:${remotePort} failed: ${m}`)
}

/** One direct-tcpip channel to verify the Pi side will accept the forward before we return a local port. */
function probeDirectTcpip(client: Client, remoteHost: string, remotePort: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      client.forwardOut('127.0.0.1', 0, remoteHost, remotePort, (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          reject(mapForwardOutError(err, remoteHost, remotePort))
          return
        }
        stream.on('error', () => {})
        stream.end()
        resolve()
      })
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

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
      // Always attach — net.Socket emits 'error' on destroy(exception) or broken pipe; no listener → uncaughtException.
      socket.on('error', () => {})

      try {
        client.forwardOut(
          socket.remoteAddress ?? '127.0.0.1',
          socket.remotePort ?? 0,
          remoteHost,
          remotePort,
          (err: Error | undefined, stream: ClientChannel) => {
            if (err) {
              // Never socket.destroy(err): that can emit an unhandled 'error' on the socket.
              socket.destroy()
              return
            }
            stream.on('error', () => {
              try {
                socket.destroy()
              } catch {
                /* ignore */
              }
            })
            socket.pipe(stream)
            stream.pipe(socket)
            stream.on('close', () => socket.destroy())
            socket.on('close', () => stream.end())
          },
        )
      } catch {
        socket.destroy()
      }
    })

    this.server = server

    let localPort: number
    try {
      localPort = await new Promise<number>((resolve, reject) => {
        server.once('error', reject)
        server.listen(params.localPort ?? 0, localHost, () => {
          const address = server.address()
          if (typeof address === 'string' || address == null) {
            reject(new Error('Unexpected server address'))
            return
          }
          resolve(address.port)
        })
      })

      await probeDirectTcpip(client, remoteHost, remotePort)
    } catch (e) {
      await this.stop()
      throw e
    }

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
