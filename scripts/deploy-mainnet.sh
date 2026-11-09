#!/usr/bin/env bash
# Guarded mainnet deployment wrapper for CIRCUIT.
#
# This script does not create wallets, keypairs, or multisigs. It only builds
# and deploys the already-audited program artifact.
#
# Required:
#   MAINNET_RPC_URL   https://... mainnet RPC endpoint
#   ANCHOR_WALLET     path to the funded deploy/upgrade-authority keypair
#   CONFIRM_MAINNET_DEPLOY=YES
#
# Optional:
#   PROGRAM_KEYPAIR   defaults to target/deploy/circuit-keypair.json
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

: "${MAINNET_RPC_URL:?Set MAINNET_RPC_URL to an https:// mainnet RPC endpoint}"
: "${ANCHOR_WALLET:?Set ANCHOR_WALLET to the funded deploy wallet keypair path}"

PROGRAM_KEYPAIR="${PROGRAM_KEYPAIR:-target/deploy/circuit-keypair.json}"

if [[ "${CONFIRM_MAINNET_DEPLOY:-}" != "YES" ]]; then
  echo "Refusing to deploy: set CONFIRM_MAINNET_DEPLOY=YES to acknowledge mainnet risk." >&2
  exit 1
fi

case "$MAINNET_RPC_URL" in
  http://*)
    echo "Refusing to deploy over plain HTTP: $MAINNET_RPC_URL" >&2
    exit 1
    ;;
  *devnet* | *testnet* | *localhost* | *127.0.0.1* | *0.0.0.0*)
    echo "Refusing non-mainnet-looking RPC URL: $MAINNET_RPC_URL" >&2
    exit 1
    ;;
esac

if [[ ! -f "$ANCHOR_WALLET" ]]; then
  echo "Deploy wallet not found: $ANCHOR_WALLET" >&2
  exit 1
fi

if [[ ! -f "$PROGRAM_KEYPAIR" ]]; then
  echo "Program keypair not found: $PROGRAM_KEYPAIR" >&2
  echo "Create a mainnet program keypair or restore the audited deployment keypair." >&2
  echo "If you create a new keypair, the program ID changes and all constants, IDL," >&2
  echo "generated types, matcher constants, and SDK constants must be updated first." >&2
  exit 1
fi

wallet_pubkey="$(solana-keygen pubkey "$ANCHOR_WALLET")"
echo "Mainnet RPC: $MAINNET_RPC_URL"
echo "Deploy wallet: $wallet_pubkey"
echo "Program keypair: $PROGRAM_KEYPAIR"
echo "Program ID: $(solana-keygen pubkey "$PROGRAM_KEYPAIR")"
echo
solana balance "$wallet_pubkey" --url "$MAINNET_RPC_URL" || true
echo

anchor build --arch v3 --tools-version v1.57

anchor deploy \
  --provider.cluster "$MAINNET_RPC_URL" \
  --provider.wallet "$ANCHOR_WALLET" \
  --program-name circuit \
  --program-keypair "$PROGRAM_KEYPAIR"

program_id="$(solana-keygen pubkey "$PROGRAM_KEYPAIR")"
echo
echo "Deployment submitted for program: $program_id"
echo "Next steps:"
echo "  1. Verify the deployed bytecode against the audited artifact."
echo "  2. Confirm the upgrade authority is your intended multisig/timelock."
echo "  3. Run a small real three-party settlement and inspect events."
echo "  4. Update Anchor.toml [programs.mainnet] and documentation if the ID changed."
