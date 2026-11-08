# CIRCUIT

CIRCUIT is a permissionless Solana protocol for persistent exchange offers,
off-chain discovery of compatible three-party cycles, and atomic settlement
through program-controlled escrow.

It solves the coordination problem where three independent participants each
have an asset another participant wants, but no direct two-party trade exists.
Offers are deposited into escrow, matched off-chain, and validated again by
the on-chain program before all three transfers execute atomically.

## Current deployment

- **Network:** Solana Devnet
- **Program ID:** `4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc`

## Components

- `programs/circuit/` — Rust/Anchor offer, escrow, lifecycle, and settlement
  program.
- `packages/matcher/` — TypeScript RPC discovery, cycle matching, account
  resolution, and settlement instruction construction.
- `packages/sdk/` — Python SDK managed with `uv`.
- `tests/` — Anchor and TypeScript protocol tests.

## Start here

1. Read the [technical documentation hub](docs/README.md).
2. Follow [Getting Started](docs/GETTING_STARTED.md).
3. Choose the [Python SDK](docs/PYTHON_SDK.md) or
   [TypeScript Matcher](docs/TYPESCRIPT_MATCHER.md) integration guide.

The [Examples](docs/EXAMPLES.md), [Protocol](docs/PROTOCOL.md), and
[Architecture](ARCHITECTURE.md) guides explain the account model and complete
settlement flow. [Deployment](docs/DEPLOYMENT.md) and
[Security](docs/SECURITY.md) cover operations and trust boundaries.

## Quick commands

```bash
npm install
npm run build
npm test
npm run typecheck
```

Python SDK commands:

```bash
npm run test:sdk
npm run build:sdk
```

The integration suite requires a built program and a running validator:

```bash
npm run test:integration
```

See [Troubleshooting](docs/TROUBLESHOOTING.md) when setup or RPC operations
fail.
