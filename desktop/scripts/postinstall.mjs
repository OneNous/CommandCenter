import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cpuFeatures = path.join(root, 'node_modules', 'cpu-features')

if (fs.existsSync(cpuFeatures)) {
  fs.rmSync(cpuFeatures, { recursive: true, force: true })
  console.log('[postinstall] Removed optional cpu-features (native ABI ≠ Electron; ssh2 falls back to JS).')
}
