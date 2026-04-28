#!/bin/bash
# Double-click: run the CoilShield ICCP mobile app shell in the browser (Vite).
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
  osascript -e 'display alert "CoilShield Mobile" message "Could not find npm. Install Node or run: nvm use default" as critical'
  exit 1
fi

MOBILE_PKG="$ROOT/design-mobile"
if [[ ! -d "$MOBILE_PKG" ]]; then
  osascript -e "display alert \"CoilShield Mobile\" message \"Missing folder: $MOBILE_PKG\" as critical"
  exit 1
fi

run_npm() {
  ( cd /tmp && "$NPM_BIN" "$@" )
}

if [[ ! -d "$MOBILE_PKG/node_modules" ]]; then
  echo "Installing design-mobile dependencies (first run only)…"
  run_npm install --prefix "$MOBILE_PKG"
fi

echo "Starting CoilShield ICCP mobile app (Vite)…"
run_npm run dev --prefix "$MOBILE_PKG"

echo ""
read -r -p "Press Enter to close this window…" _
