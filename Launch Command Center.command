#!/bin/bash
# Double-click this file in Finder to start the Electron desktop app.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Finder shells often have a minimal PATH — include Homebrew + common locations.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# nvm (if installed)
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display alert "Command Center" message "npm was not found. Install Node.js (https://nodejs.org) or ensure nvm is set up, then try again." as critical'
  exit 1
fi

cd "$ROOT/desktop"
if [[ ! -d node_modules ]]; then
  echo "Installing desktop dependencies (first run only)…"
  npm install
fi

echo "Starting Command Center (Electron)…"
npm run dev

echo ""
read -r -p "Press Enter to close this window…" _
