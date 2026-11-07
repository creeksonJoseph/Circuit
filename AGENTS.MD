# CIRCUIT — Engineering Team Instructions

You are an engineer working on CIRCUIT, a universal multi-party asset exchange protocol on Solana.

## Product objective

Build a permissionless protocol that allows independent applications to create persistent exchange offers, discover compatible three-party exchange cycles, and atomically settle those exchanges using program-controlled escrow.

## Architecture rules

1. The Solana program is the authoritative source of truth.
2. The matching engine is off-chain and untrusted.
3. The program must independently validate every proposed settlement.
4. Users must authorize deposits before settlement.
5. The program must never allow an arbitrary caller to redirect escrowed assets.
6. All settlement legs must execute atomically.
7. No centralized backend may have privileged control over settlement.
8. All amounts must use integer base units, never floating-point arithmetic.
9. Use the original SPL Token Program for MVP.
10. Never introduce partial fills, fees, or additional token standards without approval.

## Stage 1 language decisions (2026-11-07)

These decisions override any earlier proposal that conflicts with them:

- The reusable SDK is **Python** (`packages/sdk`), managed with **uv**. Do not
  add a TypeScript SDK and do not use `pip` or `python3 -m venv` directly.
- The frontend is **React + JavaScript/JSX** (`app`). Do not convert it to
  TypeScript.
- The matcher (`packages/matcher`) and integration tests (`tests`) remain
  TypeScript because they use the Anchor TypeScript client and web3.js 1.99.0.
- Authoritative build/test commands live in `BUILD_AND_TEST.md`. SDK commands:
  `npm run test:sdk`, `npm run build:sdk`, or from `packages/sdk` run
  `uv sync --locked && uv run pytest` / `uv build --wheel`. Do not use `pip`.
- Frontend commands: `npm run dev -w @circuit/app` and `npm run build -w @circuit/app`.

## Engineering rules

- Follow the approved architecture and existing project conventions.
- Read the current official Solana and Anchor documentation when necessary.
- Pin compatible dependency versions.
- Never silently upgrade frameworks or introduce experimental APIs.
- Never use a private key or secret directly in source code.
- Never deploy to mainnet.
- Never claim that a test passed without actually running it.
- Never suppress errors merely to make a test pass.
- Write tests for successful and unsuccessful behaviour.
- Keep the program, SDK, matcher and frontend responsibilities separate.
- Document any architectural deviation before implementing it.
- Do not rewrite unrelated working code.

## Security rules

- Validate all accounts supplied to instructions.
- Validate PDA derivation and ownership.
- Validate token mint, token authority and token account relationships.
- Validate offer status and expiry.
- Prevent duplicate offers and duplicate participants in a cycle.
- Prevent unauthorized withdrawals.
- Prevent replay and double settlement.
- Never trust data supplied by the matcher without on-chain validation.
- Never use a user-provided account address without checking its expected relationship.

## Required completion report

At the end of every assigned stage, report:

1. What you implemented.
2. Files created or modified.
3. Commands executed.
4. Actual test results.
5. Build results.
6. Security considerations.
7. Known limitations.
8. Anything requiring architectural approval.
9. Evidence that every acceptance criterion passed.

Do not begin the next stage unless explicitly instructed.

AFTER READING THIS FILE GO THROUGH ARCHITECTURE.MD AND THOUGHT PROCESS.MD TO GAIN MORE CONTEXT IF YOU ARE UNSURE ABOUT ANYTHING
