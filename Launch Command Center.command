#!/bin/bash
# Double-click this file in Finder to start the Electron desktop app.
set -e

THIS="${BASH_SOURCE[0]:-$0}"
if [[ "$THIS" != /* ]]; then
  THIS="$(pwd)/$THIS"
fi
ROOT="$(cd "$(dirname "$THIS")" && (pwd -P 2>/dev/null || pwd))"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

# After nvm, `npm` is often a *shell function* (not the binary). That wrapper can
# trip macOS TCC and cause: EPERM uv_cwd. Prefer the real npm on disk.
resolve_npm_bin() {
  local p=""
  if [[ "$(type -t npm 2>/dev/null)" == function ]] && declare -F nvm >/dev/null 2>&1; then
    p="$(nvm which npm 2>/dev/null || true)"
    if [[ -n "$p" && -x "$p" ]]; then
      echo "$p"
      return
    fi
  fi
  local node_bin dir
  node_bin="$(command -v node 2>/dev/null || true)"
  if [[ -n "$node_bin" ]]; then
    dir="$(dirname "$node_bin")"
    if [[ -x "$dir/npm" ]]; then
      echo "$dir/npm"
      return
    fi
  fi
  command -v npm 2>/dev/null || true
}

NPM_BIN="$(resolve_npm_bin)"
if [[ -z "$NPM_BIN" || ! -x "$NPM_BIN" ]]; then
  osascript -e 'display alert "Command Center" message "Could not find a real npm binary (nvm/Homebrew PATH issue). Open Terminal, run: nvm use default  then try again." as critical'
  exit 1
fi

DESKTOP_PKG="$ROOT/desktop"
if [[ ! -d "$DESKTOP_PKG" ]]; then
  osascript -e "display alert \"Command Center\" message \"Missing folder: $DESKTOP_PKG\" as critical"
  exit 1
fi

run_npm() {
  ( cd /tmp && "$NPM_BIN" "$@" )
}

if [[ ! -d "$DESKTOP_PKG/node_modules" ]]; then
  echo "Installing desktop dependencies (first run only)…"
  run_npm install --legacy-peer-deps --prefix "$DESKTOP_PKG"
fi

echo "Starting Command Center (Electron)…"
run_npm run dev --prefix "$DESKTOP_PKG"

echo ""
read -r -p "Press Enter to close this window…" _
