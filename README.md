# CIRCUIT

CIRCUIT is a permissionless, multi-party asset exchange protocol on Solana. It
lets independent applications create persistent exchange offers, discover
compatible three-party cycles off-chain, and settle every leg atomically through
a shared Anchor program.

> **Stage 1 status:** repository scaffold only.
>
> The program contains one trivial `initialize` instruction that creates a
> `ProtocolConfig` PDA. Offer creation, escrow, cancellation, expiry,
> settlement, and cycle matching are **not implemented**. Nothing here is
> deployed to mainnet.

## Stack

| Layer | Technology | Version |
|---|---|---|
| On-chain program | Rust + Anchor | Rust 1.99.1, Anchor 1.2.2 |
| Solana toolchain | Agave / Solana CLI | 4.1.2 |
| Program build | Platform tools / SBPF | v1.57 / v3 |
| Matching engine | TypeScript + Node.js | TypeScript 5.9.3, Node 26.13.0 |
| SDK | Python + uv | Python 3.14.4, uv 0.13.7, standard library only |
| Frontend | React + JavaScript + Vite | React 19.3.1, Vite 7.3.7 |
| Integration tests | Mocha + ts-mocha | Mocha 11.7.5 |
| SDK tests | pytest | 9.2.0 |
| Matcher tests | Vitest | 5.1.0 |
| Package manager | npm workspaces | npm 11.20.0 |

The full dependency rationale is in [`PROPOSED_DEPENDENCIES.md`](PROPOSED_DEPENDENCIES.md),
with a Stage 1 revision note for the Python SDK and JavaScript frontend.

## Repository layout

```text
circuit/
├── Anchor.toml                  # Anchor workspace, localnet/devnet IDs
├── Cargo.toml                   # Rust workspace
├── programs/circuit/            # Anchor program (scaffold only)
├── packages/
│   ├── matcher/                 # TypeScript cycle matcher (scaffold)
│   └── sdk/                     # Python SDK (scaffold)
├── app/                         # React + JavaScript frontend (scaffold)
├── tests/                       # Mocha integration tests
├── scripts/                     # Toolchain, SDK, and Anchor test helpers
├── docs/                        # Protocol, security, and progress notes
├── BUILD_AND_TEST.md            # Exact build/test commands
└── STAGE1_REPORT.md             # Stage 1 evidence and command output
```

## Prerequisites

- Rust 1.99.1 with `rustfmt` and `clippy`
- Solana CLI 4.1.2 (`solana`, `solana-test-validator`, `cargo-build-sbf`)
- Anchor CLI 1.2.2
- Node.js 26.13.0 and npm 11.20.0
- Python 3.11+ (3.14.4 used here)
- uv 0.13.7 (Python package and environment manager)

Verify the toolchain at any time:

```bash
bash scripts/check-toolchain.sh
```

The expected output and installation sequence are in
[`BUILD_AND_TEST.md`](BUILD_AND_TEST.md).

## Quick start

```bash
# 1. Dependencies for the JavaScript workspaces
npm install

# 2. Build the program and generate the IDL/types
anchor build --arch v3 --tools-version v1.57

# 3. Run the local integration suite
NO_DNA=1 anchor test --validator legacy

# 4. TypeScript/SDK unit tests
npm run test

# 5. Production frontend build
npm run build
```

`anchor test` uses `--validator legacy` because Anchor 1.2.2 defaults to
**surfpool**, which is not installed. `legacy` uses the
`solana-test-validator` bundled with Solana CLI 4.1.2.

## Component commands

### Anchor program

```bash
anchor build --arch v3 --tools-version v1.57
NO_DNA=1 anchor test --validator legacy
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
```

### Python SDK

```bash
cd packages/sdk
uv sync --locked
uv run pytest
uv build --wheel
```

Or from the root:

```bash
npm run test:sdk
npm run build:sdk
```

### Matcher

```bash
npm run build -w @circuit/matcher
npm run test -w @circuit/matcher
npm run typecheck -w @circuit/matcher
```

### Frontend

```bash
npm run dev -w @circuit/app       # http://127.0.0.1:5173
npm run build -w @circuit/app
npm run preview -w @circuit/app   # http://127.0.0.1:4173
```

### Integration tests

```bash
npm run test:integration          # requires a built program and a running validator
```

## Environment variables

Copy the public example:

```bash
cp .env.example .env
```

Only public values belong there. The frontend reads `VITE_SOLANA_RPC_URL`,
`VITE_CIRCUIT_PROGRAM_ID`, and `VITE_SOLANA_CLUSTER`. The Python SDK reads
`CIRCUIT_RPC_URL` and `CIRCUIT_PROGRAM_ID` when a caller chooses to use them.
No private key or seed phrase is ever read from the environment by the
frontend.

## Security rules

- The on-chain program is the only authority for protocol rules.
- The matcher is untrusted and only proposes account orderings.
- Every settlement must be revalidated on-chain.
- Assets are escrowed under a program-controlled PDA.
- No backend may have privileged settlement control.
- Amounts are integer base units, never floating point.
- Only the original SPL Token program is in scope for the MVP.
- No private keys, seed phrases, or deploy keypairs are committed.

See [`docs/SECURITY.md`](docs/SECURITY.md) and
[`AGENTS.MD`](AGENTS.MD) for the full rules.

## Documentation

| Document | Purpose |
|---|---|
| [`BUILD_AND_TEST.md`](BUILD_AND_TEST.md) | Exact setup, build, and test commands |
| [`STAGE1_REPORT.md`](STAGE1_REPORT.md) | Stage 1 implementation evidence |
| [`ENVIRONMENT_REPORT.md`](ENVIRONMENT_REPORT.md) | Toolchain discovery and installation record |
| [`TECHNICAL_PLAN.md`](TECHNICAL_PLAN.md) | Protocol design, risks, and stage plan |
| [`PROPOSED_DEPENDENCIES.md`](PROPOSED_DEPENDENCIES.md) | Pinned dependency rationale |
| [`PROPOSED_PROJECT_STRUCTURE.md`](PROPOSED_PROJECT_STRUCTURE.md) | Original monorepo proposal |
| [`docs/PROTOCOL.md`](docs/PROTOCOL.md) | Planned account model and instructions |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Invariants and threat model |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Stage tracker |

## Stage 1 deviations from the Stage 0 proposal

These changes were explicitly requested for Stage 1 and are documented so future
agents do not revert them:

1. **The SDK is Python**, not TypeScript. Do not add a parallel TypeScript SDK.
2. **The frontend is React + JavaScript/JSX**, not TypeScript. Do not convert it
   to TypeScript.
3. **The matcher and integration tests remain TypeScript**, because they use the
   Anchor TypeScript client and `@solana/web3.js` 1.99.0.
4. The Python SDK is managed with **uv 0.13.7**, not pip. `packages/sdk/uv.lock`
   is committed. Do not replace `uv` with pip/venv.
5. The Python SDK has no runtime dependencies yet. Solana Python libraries will
   be selected and pinned when the SDK implementation stage begins.

## Next stage

Stage 2 adds the `Offer` account, canonical PDA derivation, and the
escrow-funded `create_offer` instruction. It must not start until Stage 1 is
reviewed and approved.
