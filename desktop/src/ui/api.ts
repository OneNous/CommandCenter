export function makeApiBase(localPort: number) {
  return `http://127.0.0.1:${localPort}`
}

export async function apiGet<T>(base: string, path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  return (await res.json()) as T
}

