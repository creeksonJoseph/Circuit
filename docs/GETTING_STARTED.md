# Getting Started

## Prerequisites

- Node.js 26+ and npm 11+
- Rust and Cargo
- Solana and Anchor CLI versions compatible with `Anchor.toml`
- Python 3.11+ and `uv` for the SDK

## Install and validate

From the repository root:

```bash
npm install
npm run build
npm run typecheck
npm test
```

For the SDK:

```bash
npm run test:sdk
npm run build:sdk
```

The integration suite needs a built Anchor program and a running local
validator:

```bash
npm run test:integration
```

Do not use a production wallet or real assets for local testing.

## Choose an integration path

- Use the [Python SDK](PYTHON_SDK.md) to derive addresses, decode offers, and
  build program instructions.
- Use the [TypeScript Matcher](TYPESCRIPT_MATCHER.md) to discover and prepare a
  three-party settlement.
- Follow [Examples](EXAMPLES.md) for the complete account preparation and
  transaction sequence.

The deployed Devnet program and configuration are documented in
[Deployment](DEPLOYMENT.md). Read [Protocol](PROTOCOL.md) before constructing
accounts manually.

---

[Documentation index](README.md) · [Python SDK](PYTHON_SDK.md) ·
[TypeScript Matcher](TYPESCRIPT_MATCHER.md)
