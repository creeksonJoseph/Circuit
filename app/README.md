# @circuit/app

React + JavaScript demonstration application for CIRCUIT.

**Stage 1 status:** static scaffold. It displays public cluster/program
configuration and does not connect a wallet or submit transactions yet.

This package intentionally uses **JavaScript and JSX only** (per the Stage 1
decision). Do not convert it to TypeScript.

## Commands

```bash
# From the repository root
npm run dev -w @circuit/app
npm run build -w @circuit/app
npm run preview -w @circuit/app
```

## Environment

Copy the public example and adjust if needed:

```bash
cp .env.example .env
```

Only `VITE_*` values reach the browser. Never place a private key, seed phrase,
or deploy keypair in an environment variable consumed by the frontend.

## Boundaries

- The app never validates protocol rules; the program does.
- The app never holds private keys; signing goes through a wallet adapter.
- No backend is required.
