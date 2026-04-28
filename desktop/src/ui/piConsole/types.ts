export type PiRunRecord = {
  at: number
  durationMs: number
  code: number | null
  signal?: string | null
  stdout: string
  stderr: string
  error?: string
}

export type PiPreset = {
  id: string
  label: string
  command: string
  group: string
  hint?: string
}
