#!/usr/bin/env bash
set -euo pipefail

# Read-only toolchain check. Safe to run at any time.
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$HOME/.local/bin:$PATH"

echo "rustc:                $(rustc --version 2>&1 || echo MISSING)"
echo "cargo:                $(cargo --version 2>&1 || echo MISSING)"
echo "rustup active:        $(rustup show active-toolchain 2>&1 || echo MISSING)"
echo "solana:               $(solana --version 2>&1 || echo MISSING)"
echo "solana-test-validator:$(solana-test-validator --version 2>&1 || echo MISSING)"
echo "anchor:               $(anchor --version 2>&1 || echo MISSING)"
echo "node:                 $(node --version 2>&1 || echo MISSING)"
echo "npm:                  $(npm --version 2>&1 || echo MISSING)"
echo "python:               $(python3 --version 2>&1 || echo MISSING)"
echo "uv:                   $(uv --version 2>&1 || echo 'MISSING (expected at ~/.local/bin/uv)')"

if [ -f "$HOME/.config/solana/id.json" ]; then
  echo "wallet:               $(solana-keygen pubkey "$HOME/.config/solana/id.json") (outside repository)"
else
  echo "wallet:               MISSING (expected at ~/.config/solana/id.json)"
fi
