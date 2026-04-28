#!/bin/bash
# Double-click this file in Finder to start the Electron desktop app.
set -e

# Resolve repo root (BASH_SOURCE is more reliable than $0 for .command files)
THIS="${BASH_SOURCE[0]:-$0}"
if [[ "$THIS" != /* ]]; then
  THIS="$(pwd)/$THIS"
fi
ROOT="$(cd "$(dirname "$THIS")" && (pwd -P 2>/dev/null || pwd))"

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

DESKTOP_PKG="$ROOT/desktop"
if [[ ! -d "$DESKTOP_PKG" ]]; then
  osascript -e "display alert \"Command Center\" message \"Missing folder: $DESKTOP_PKG\" as critical"
  exit 1
fi

# npm calls process.cwd() at startup. If the shell cwd is under Desktop/Documents,
# macOS can return EPERM (uv_cwd). Use a neutral cwd + --prefix for npm operations.
cd /tmp

if [[ ! -d "$DESKTOP_PKG/node_modules" ]]; then
  echo "Installing desktop dependencies (first run only)…"
  npm install --prefix "$DESKTOP_PKG"
fi

echo "Starting Command Center (Electron)…"
npm run dev --prefix "$DESKTOP_PKG"

echo ""
read -r -p "Press Enter to close this window…" _
