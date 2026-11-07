# CIRCUIT — Proposed Project Structure

**Status:** Stage 0 proposal, implemented in Stage 1 with documented changes.  
**Date:** 2026-11-06 (Stage 0); revised 2026-11-07 (Stage 1)  
**Repository model:** Single monorepo containing the on-chain program, Python SDK, off-chain TypeScript matcher, React + JavaScript demo, and integration/security tests.

> **Stage 1 revision (2026-11-07): implemented tree differs from the proposal**
>
> The user changed two language decisions when Stage 1 began:
>
> - `packages/sdk` is a **Python** package (`circuit-sdk`), not TypeScript.
> - `app` is **React + JavaScript/JSX**, not TypeScript.
>
> The matcher and integration tests remain TypeScript. The exact implemented
> tree is documented in `README.md` and the commands are in
> `BUILD_AND_TEST.md`.
>
> Future agents must not:
>
> - add a parallel TypeScript SDK;
> - convert `app/` to TypeScript;
> - replace the Python SDK with TypeScript.
>
> The Stage 0 tree below is retained as historical design context. Where it
> conflicts with `README.md` or `BUILD_AND_TEST.md`, the latter documents
> govern.

---

## 1. Design rules

1. The on-chain program is the only authority for protocol rules.
2. The matcher only discovers candidates; it never signs and never grants privileges.
3. The SDK constructs transactions and derives addresses; it does not duplicate on-chain validation as a source of truth.
4. The frontend only presents state and requests wallet signatures.
5. Tests exercise the real program through a real local validator, not a mock of the program.
6. No private keys, seed phrases, or Devnet wallet files are committed.

---

## 2. Proposed directory tree

```text
circuit/
├── AGENTS.MD                          # existing engineering instructions
├── ARCHTECTURE.MD                     # existing architecture/playbook
├── README.md                          # project overview and quick start
├── Anchor.toml                        # Anchor workspace + local/devnet program IDs
├── Cargo.toml                         # Rust workspace
├── Cargo.lock                         # committed, reproducible Rust graph
├── rust-toolchain.toml                # pinned Rust 1.99.1
├── package.json                       # npm workspaces root
├── package-lock.json                  # committed npm lockfile
├── tsconfig.base.json                 # shared TypeScript settings
├── .nvmrc                             # 26.13.0
├── .gitignore
├── .env.example                       # public configuration only
│
├── programs/
│   └── circuit/
│       ├── Cargo.toml
│       ├── Xargo.toml                 # only if required by the chosen build path
│       ├── src/
│       │   ├── lib.rs                 # program entrypoint, instruction dispatch
│       │   ├── constants.rs           # seeds, limits, token program IDs
│       │   ├── errors.rs              # CircuitError enum
│       │   ├── events.rs              # OfferCreated, OfferCancelled, OfferExpired, CycleSettled
│       │   ├── state/
│       │   │   ├── mod.rs
│       │   │   └── offer.rs           # Offer account + OfferStatus
│       │   ├── instructions/
│       │   │   ├── mod.rs
│       │   │   ├── create_offer.rs
│       │   │   ├── cancel_offer.rs
│       │   │   ├── refund_expired.rs
│       │   │   └── settle_cycle.rs
│       │   └── utils/
│       │       ├── mod.rs
│       │       ├── pda.rs             # canonical PDA validation helpers
│       │       ├── token.rs           # token account/mint/escrow validation
│       │       └── cycle.rs           # three-party cycle validation
│       └── tests/                     # optional Rust LiteSVM tests
│           └── create_offer.rs
│
├── packages/
│   ├── sdk/
│   │   ├── package.json               # @circuit/sdk
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts               # public exports
│   │   │   ├── program.ts             # Program<Circuit> factory, provider config
│   │   │   ├── constants.ts           # seeds, program ID, token program IDs
│   │   │   ├── pda.ts                 # offer, escrow authority, ATA derivation
│   │   │   ├── amounts.ts             # bigint <-> BN, base-unit parsing (no floats)
│   │   │   ├── offers.ts              # create/cancel/refund instruction builders
│   │   │   ├── settlement.ts          # settle_cycle instruction builder
│   │   │   ├── fetch.ts               # account fetchers and filters
│   │   │   ├── errors.ts              # Anchor error-code mapping
│   │   │   ├── types.ts               # SDK-facing types
│   │   │   ├── idl/
│   │   │   │   └── circuit.json       # copied from target/idl by anchor build
│   │   │   └── generated/
│   │   │       └── circuit.ts         # copied from target/types by anchor build
│   │   └── tests/
│   │       ├── amounts.test.ts
│   │       ├── pda.test.ts
│   │       └── builders.test.ts
│   │
│   └── matcher/
│       ├── package.json               # @circuit/matcher
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── types.ts               # OfferEdge, Cycle, MatchResult
│       │   ├── indexer.ts             # getProgramAccounts + decoding
│       │   ├── graph.ts               # (mint, amount) indexing
│       │   ├── cycles.ts              # directed three-cycle search + canonicalisation
│       │   ├── filters.ts             # status, expiry, duplicate-maker filters
│       │   └── planner.ts             # cycle -> settlement account plan
│       └── tests/
│           ├── graph.test.ts
│           ├── cycles.test.ts
│           └── fixtures.ts
│
├── app/
│   ├── package.json                   # @circuit/app
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── providers/
│       │   ├── SolanaProvider.tsx
│       │   └── WalletProvider.tsx
│       ├── components/
│       │   ├── OfferList.tsx
│       │   ├── CreateOfferForm.tsx
│       │   ├── CycleExplorer.tsx
│       │   ├── SettleCycleButton.tsx
│       │   └── TransactionStatus.tsx
│       ├── hooks/
│       │   ├── useOffers.ts
│       │   ├── useCycleSearch.ts
│       │   └── useCircuitProgram.ts
│       ├── lib/
│       │   ├── config.ts              # RPC URL, program ID from VITE_* public env
│       │   └── format.ts              # display formatting only
│       └── styles.css
│
├── tests/
│   ├── package.json                   # @circuit/tests
│   ├── tsconfig.json
│   ├── integration/
│   │   ├── helpers/
│   │   │   ├── setup.ts               # wallets, mints, ATAs, token balances
│   │   │   ├── offers.ts              # create offers through the SDK
│   │   │   ├── assertions.ts          # balance/status assertions
│   │   │   └── compute.ts             # tx size + compute-unit logging
│   │   ├── offer/
│   │   │   ├── create_offer.test.ts
│   │   │   ├── cancel_offer.test.ts
│   │   │   └── refund_expired.test.ts
│   │   ├── settlement/
│   │   │   ├── settle_cycle.test.ts
│   │   │   └── atomicity.test.ts
│   │   └── security/
│   │       ├── unauthorized.test.ts
│   │       ├── pda_substitution.test.ts
│   │       ├── replay.test.ts
│   │       └── token_program.test.ts
│   └── fixtures/
│       └── demo-mints.json            # public keys/amounts only; no secrets
│
├── scripts/
│   ├── create-demo-mints.ts           # local/devnet mint + distribution script
│   ├── seed-offers.ts                 # demo offer seeding
│   └── verify-devnet.ts               # deployed-program smoke check
│
├── docs/
│   ├── PROTOCOL.md                    # account model, instruction semantics
│   ├── BUILD_AND_TEST.md              # exact commands and expected results
│   ├── SECURITY.md                    # invariants, threat model, test matrix
│   ├── DEVNET.md                      # deployment and demo runbook
│   └── PROGRESS.md                    # stage tracker and completion reports
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # optional: build + test on Ubuntu 24.04
│
└── target/                            # ignored: Anchor/Solana build artifacts
```

---

## 3. Responsibility boundaries

| Area | Owns | Must not own |
|---|---|---|
| `programs/circuit` | Offer state, escrow authority, PDA validation, expiry, CPI authorization, atomic settlement | Off-chain matching, UI concerns, trusted matcher input |
| `packages/sdk` | PDA derivation, account decoding, transaction/instruction construction, amount conversion, error mapping | Protocol policy decisions, React state |
| `packages/matcher` | Offer indexing, graph construction, three-cycle discovery, canonicalisation, settlement account planning | Signing, escrow authority, privileged settlement |
| `app` | Wallet connection, forms, display, transaction submission | Protocol validation, private keys, backend privileges |
| `tests` | End-to-end and adversarial verification against the real program | Production code paths that bypass the SDK |
| `scripts` | Local/devnet fixtures and smoke checks | Committed secrets, mainnet deployment |

---

## 4. Workspace configuration

### 4.1 Package manager: npm workspaces

The architecture document proposed `pnpm-workspace.yaml`, but pnpm is **not installed** on this machine. The proposed default is npm workspaces, which is already available:

```json
{
  "private": true,
  "workspaces": ["packages/*", "app", "tests"]
}
```

This is an explicit deviation from the architecture document and requires approval. If pnpm is preferred instead:

```bash
npm install -g pnpm@12.18.0
```

and add `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "app"
  - "tests"
```

Do not commit both `package-lock.json` and `pnpm-lock.yaml`; choose one package manager.

### 4.2 Workspace package names

| Directory | Package name | Purpose |
|---|---|---|
| `packages/sdk` | `@circuit/sdk` | Reusable TypeScript client |
| `packages/matcher` | `@circuit/matcher` | Off-chain cycle matcher |
| `app` | `@circuit/app` | React/Vite demo |
| `tests` | `@circuit/tests` | Integration and security tests |

### 4.3 Root scripts

```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "test:integration": "npm run test:integration -w @circuit/tests",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "clean": "rm -rf target node_modules packages/*/dist app/dist"
  }
}
```

Anchor's `[scripts] test` will call:

```toml
[scripts]
test = "npm run test:integration -w @circuit/tests"
```

`anchor test --validator legacy` sets `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET` for that script.

---

## 5. Anchor workspace configuration

Proposed `Anchor.toml` shape:

```toml
[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[programs.localnet]
circuit = "<CIRCUIT_PROGRAM_ID>"

[programs.devnet]
circuit = "<CIRCUIT_PROGRAM_ID>"

[scripts]
test = "npm run test:integration -w @circuit/tests"

[workspace]
idls = "packages/sdk/src/idl"
types = "packages/sdk/src/generated"
```

Notes:

- `skip_local_validator` is intentionally **not** set for the TypeScript integration suite. The suite needs a real RPC endpoint.
- If Rust LiteSVM tests are added later, they run via `cargo test` and do not need the validator. Do not set `skip_local_validator = true` globally, because it would also skip the validator for the TypeScript suite.
- `anchor test` defaults to surfpool in Anchor 1.2.2. Use `anchor test --validator legacy` until/unless surfpool is explicitly installed and approved.
- The program ID is generated in Stage 1. The same ID can be used for localnet and Devnet; the keypair must remain outside version control.

---

## 6. IDL and generated-type flow

```text
anchor build
   │
   ├── target/idl/circuit.json
   │      └── copied to packages/sdk/src/idl/circuit.json
   │
   └── target/types/circuit.ts
          └── copied to packages/sdk/src/generated/circuit.ts
                     │
                     ├── @circuit/sdk
                     ├── @circuit/matcher
                     ├── @circuit/app
                     └── @circuit/tests
```

Rules:

- The SDK owns the checked-in IDL and generated types. The app and matcher must not import from `target/`.
- `anchor build` regenerates both artifacts. Commit the generated SDK copies so the TypeScript packages build without a prior Rust build in CI.
- If the program and SDK versions drift, the build must fail loudly. Add a small CI check that compares the IDL's program address/version against the SDK constant.

---

## 7. Program module layout and naming

### 7.1 Accounts

| Account | Seeds | Owner | Purpose |
|---|---|---|---|
| `Offer` | `[b"offer", maker, nonce_le]` | CIRCUIT program | Persistent offer terms and status |
| Escrow authority | `[b"escrow", offer_key]` | System program (PDA, no data) | Authority for the escrow token account |
| Escrow token account | ATA of `(escrow_authority, offered_mint, SPL Token)` | SPL Token program | Holds the maker's deposited tokens |

### 7.2 Instructions

| Instruction | Signer | Purpose |
|---|---|---|
| `create_offer` | Maker | Create offer PDA, create/verify escrow ATA, deposit offered tokens |
| `cancel_offer` | Maker only | Refund escrow to maker, close escrow ATA, mark `Cancelled` |
| `refund_expired` | Anyone (permissionless) | Refund escrow to the original maker after expiry, mark `Expired` |
| `settle_cycle` | Anyone (permissionless) | Validate three offers and execute all three escrow transfers atomically |

### 7.3 Status state machine

```text
                 create_offer
                      │
                      ▼
                    Open
                   /  |  \
        cancel    /   |   \   settle_cycle
                 ▼    |    ▼
            Cancelled  │  Settled
                       │
              refund_expired (after expiry)
                       ▼
                    Expired
```

All terminal states are final. Offer accounts are retained after terminal state for auditability in the MVP.

---

## 8. SDK public surface (proposed)

```ts
// Address derivation
findOfferPda(maker: PublicKey, nonce: bigint): [PublicKey, number]
findEscrowAuthority(offer: PublicKey): [PublicKey, number]
getEscrowAta(offer: PublicKey, offeredMint: PublicKey): PublicKey
getMakerAta(maker: PublicKey, mint: PublicKey): PublicKey

// Reads
fetchOffer(connection, offer: PublicKey): Promise<OfferAccount | null>
fetchOpenOffers(connection): Promise<OfferAccount[]>

// Writes
buildCreateOfferTx(...): Promise<Transaction>
buildCancelOfferTx(...): Promise<Transaction>
buildRefundExpiredTx(...): Promise<Transaction>
buildSettleCycleTx(cycle: Cycle): Promise<Transaction>

// Amounts
parseBaseUnits(value: string, decimals: number): bigint
formatBaseUnits(value: bigint, decimals: number): string
```

Amounts are always integer base units. The SDK must never use JavaScript `number` for token amounts or floating-point arithmetic.

---

## 9. Matcher public surface (proposed)

```ts
interface OfferEdge {
  offer: PublicKey;
  maker: PublicKey;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  offeredAmount: bigint;
  requestedAmount: bigint;
  expiresAt: bigint;
}

interface Cycle {
  offers: [OfferEdge, OfferEdge, OfferEdge]; // A, B, C
  escrows: [PublicKey, PublicKey, PublicKey];
  destinations: [PublicKey, PublicKey, PublicKey];
}

findCycles(offers: OfferEdge[], now: bigint): Cycle[]
```

The matcher:

- indexes offers by `(offeredMint, offeredAmount)`;
- finds directed three-cycles where each offer's request matches the next offer's offer;
- rejects duplicate makers, expired offers, and non-open offers;
- canonicalises rotations so the same cycle is not returned three times;
- returns account plans only; the program revalidates everything.

---

## 10. Test layout

| Test area | Location | Runner |
|---|---|---|
| Program unit helpers / optional in-process VM | `programs/circuit/tests/` | `cargo test` (LiteSVM 0.15.0 if approved) |
| SDK unit tests | `packages/sdk/tests/` | Vitest |
| Matcher unit tests | `packages/matcher/tests/` | Vitest |
| End-to-end offer lifecycle | `tests/integration/offer/` | Mocha + `ts-mocha` against `solana-test-validator` |
| End-to-end settlement and atomicity | `tests/integration/settlement/` | Mocha + `ts-mocha` |
| Adversarial/security cases | `tests/integration/security/` | Mocha + `ts-mocha` |
| Frontend smoke/manual demo | `app/` + local validator | Manual + Vite build |

---

## 11. Build order

```bash
# 1. Program + IDL
anchor build --arch v3 --tools-version v1.57

# 2. TypeScript packages (SDK first, then matcher, then app)
npm run build -w @circuit/sdk
npm run build -w @circuit/matcher
npm run build -w @circuit/app

# 3. Tests
npm run test -w @circuit/sdk
npm run test -w @circuit/matcher
anchor test --validator legacy
```

In CI, run the same order. Do not let the frontend import `target/` artifacts directly.

---

## 12. Secrets and generated files

Add to `.gitignore`:

```gitignore
# Rust / Anchor
target/
.anchor/
.surfpool/
test-ledger/
**/*.rs.bk

# Node
node_modules/
dist/
.vite/
coverage/

# Environment and keys
.env
.env.*
!.env.example
*.keypair.json
id.json
**/deploy/*-keypair.json

# Logs
*.log
```

Rules:

- `target/deploy/circuit-keypair.json` is generated by Anchor and must never be committed.
- `~/.config/solana/id.json` is outside the repo and must never be copied into it.
- `.env.example` contains only public values: RPC URL, cluster name, program ID.
- The frontend uses the wallet adapter for signing; it never reads a private key from an environment variable.
- Devnet deployment uses a local keypair or wallet, not a committed secret.

---

## 13. Documentation set

| File | Contents |
|---|---|
| `README.md` | What CIRCUIT is, monorepo layout, quick start |
| `docs/PROTOCOL.md` | Account model, PDA seeds, instruction semantics, state machine |
| `docs/BUILD_AND_TEST.md` | Exact toolchain versions, build/test commands, expected output |
| `docs/SECURITY.md` | Invariants, threat model, adversarial test matrix, known limitations |
| `docs/DEVNET.md` | Devnet deployment, airdrop, demo fixture creation, verification |
| `docs/PROGRESS.md` | Stage tracker, completion reports, verified evidence |

`AGENTS.MD` remains at the repository root. The existing `ARCHTECTURE.MD` and `thought process.md` can remain at the root for now; moving them into `docs/` is an optional Stage 1 cleanup that should be approved rather than done silently.

---

## 14. Stage 1 scaffold cautions

1. **Do not run `anchor init` directly in the repository root.** It may overwrite `AGENTS.MD`, `ARCHTECTURE.MD`, or `thought process.md`. Scaffold into a temporary directory and merge the generated files, or create the workspace files manually from the Anchor 1.2.2 template.
2. Use `--test-template mocha` if `anchor init` is used, because the default template is Rust LiteSVM. The Mocha template gives the TypeScript integration path described in this plan.
3. Keep the generated `initialize` instruction only as a temporary build/test gate. Replace it with the CIRCUIT instruction set in Stage 2; do not leave a meaningless instruction in the final program.
4. Do not add business logic in Stage 1. The only acceptable program code is the scaffold and a trivial test instruction.
5. Run `anchor build --arch v3 --tools-version v1.57` and `anchor test --validator legacy` before adding features.

---

## 15. Approval items for the structure

- [ ] npm workspaces (recommended) or pnpm 12.18.0.
- [ ] Package names `@circuit/sdk`, `@circuit/matcher`, `@circuit/app`, `@circuit/tests`.
- [ ] IDL and generated types live under `packages/sdk/src/` and are committed.
- [ ] `anchor test --validator legacy` is the local integration command.
- [ ] Existing root documentation files remain in place during Stage 1.
- [ ] Optional Rust LiteSVM tests are either included or explicitly omitted.
