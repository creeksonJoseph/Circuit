# CIRCUIT

CIRCUIT is a permissionless Solana protocol for persistent exchange offers,
off-chain discovery of three-party cycles, and atomic settlement through
program-controlled escrow.

## Components

- `programs/circuit/` — Rust/Anchor protocol program and escrow lifecycle.
- `packages/matcher/` — TypeScript RPC discovery, cycle matching, account
  resolution, and settlement-plan construction.
- `packages/sdk/` — Python SDK managed with `uv`.
- `tests/` — Anchor/TypeScript protocol and matcher integration tests.
- `docs/` — public protocol and security documentation.

The unfinished React demo is intentionally not part of the final repository.
The matcher is untrusted: the on-chain program independently validates every
settlement and remains the source of truth.

## Requirements

- Rust, Cargo, and the Solana/Anchor toolchain described by the project
  scripts and `Anchor.toml`
- Node.js 26+ and npm 11+
- Python 3.11+ and `uv`

## Common commands

```bash
npm install
npm run build
npm run test
npm run typecheck
npm run format:check
```

For the Python SDK:

```bash
npm run test:sdk
npm run build:sdk
```

The narrow integration suite requires a built program and a running validator:

```bash
npm run test:integration
```

## Deployment

The program has been deployed and verified on Solana Devnet. The deployed
program ID is
`4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc`. See
[`docs/STAGE8_DEVNET_DEPLOYMENT.md`](docs/STAGE8_DEVNET_DEPLOYMENT.md) for the
deployment evidence and its limitations. The repository does not include
private keys or deploy keypairs.

## Public documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — protocol architecture and invariants.
- [`docs/PROTOCOL.md`](docs/PROTOCOL.md) — account model and instructions.
- [`docs/SECURITY.md`](docs/SECURITY.md) — security rules and threat model.
- [`AGENTS.MD`](AGENTS.MD) — repository engineering guidance.
