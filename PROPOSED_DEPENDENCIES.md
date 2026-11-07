# CIRCUIT — Proposed Dependencies

**Status:** Stage 0 proposal, with a Stage 1 revision.  
**Date:** 2026-11-06 (Stage 0); revised 2026-11-07 (Stage 1)  
**Decision rule:** Use the latest **stable, non-release-candidate** versions that Anchor 1.2.2 explicitly supports, pin them exactly, and avoid mixing major versions of the Solana JavaScript client.

> **Stage 1 revision (2026-11-07): SDK and frontend language change**
>
> The user changed two Stage 0 decisions for Stage 1:
>
> 1. The **SDK is Python**, not TypeScript. Implemented at `packages/sdk`.
> 2. The **frontend is React + JavaScript/JSX**, not TypeScript. Implemented at
>    `app`.
>
> The **matcher** (`packages/matcher`) and **integration tests** (`tests`) remain
> TypeScript because they use the Anchor TypeScript client and
> `@solana/web3.js` 1.99.0.
>
> Python SDK tooling for Stage 1 (new, because the Stage 0 plan had no Python
> packages). These are dev/build tools only; the SDK has no runtime
> dependencies yet. The SDK is managed with **uv**, not `pip`:
>
> | Package | Version | Purpose |
> |---|---|---|
> | Python | 3.14.4 (installed) | SDK runtime |
> | `uv` | 0.13.7 | Environment, lockfile, and build manager (replaces pip/venv/build) |
> | `setuptools` | 78.1.1 | Build backend, used by `uv build` in an isolated environment |
> | `wheel` | 0.48.0 | Wheel build backend, used by `uv build` |
> | `pytest` | 9.2.0 | SDK tests (`uv run pytest`) |
>
> Exact commands for future agents:
>
> ```bash
> # Python SDK (uv; do not use pip or create a TypeScript SDK)
> cd packages/sdk && uv sync --locked && uv run pytest
> npm run test:sdk
> npm run build:sdk
>
> # React + JavaScript frontend (do not convert app/ to TypeScript)
> npm run build -w @circuit/app
> npm run dev -w @circuit/app
> ```
>
> The detailed, authoritative commands are in `BUILD_AND_TEST.md`. The
> Stage 0 rationale below is retained for the approved Solana/Anchor/matcher
> stack and for historical context.

---

## 1. Summary

| Layer | Proposed version | Exact pin? | Compatibility basis |
|---|---|---|---|
| Rust | **1.99.1** | Yes, via `rust-toolchain.toml` | Anchor 1.2.2 MSRV is 1.89; 1.99.1 is current stable |
| Solana CLI / Agave | **4.1.2** | Yes | Anchor 1.2.2 release notes recommend 4.1.2 |
| Platform tools | **v1.57** | Yes, via Anchor flags if needed | Anchor 1.2.2 release notes |
| SBPF architecture | **v3** | Yes | Anchor 1.2.2 release notes |
| Anchor CLI | **1.2.2** | Yes | Latest stable Anchor release |
| `anchor-lang` / `anchor-spl` | **1.2.2** | Yes (`=1.2.2`) | Must match the CLI exactly |
| `@anchor-lang/core` | **1.2.2** | Yes | TypeScript client for Anchor 1.2.2 |
| `@solana/web3.js` | **1.99.0** | Yes | Anchor 1.2.2 client is web3.js **v1**, not v3 |
| `@solana/spl-token` | **0.4.15** | Yes | Works with web3.js 1.99.0 |
| Node.js | **26.13.0** | Yes, via `.nvmrc` | Current LTS; satisfies `>=20.18` |
| npm | **11.20.0** | Yes | Already installed; npm workspaces |
| TypeScript | **5.9.3** | Yes | Matcher and integration tests only (not the frontend or SDK) |
| Python SDK | **3.14.4** | Yes | User-directed Stage 1 change; no runtime dependencies yet |
| React + JavaScript | **19.3.1** | Yes | Frontend is JS/JSX, not TypeScript |
| Vite | **7.3.7** | Yes | Conservative stable major; Node 26 compatible |
| Test runner (integration) | **Mocha 11.7.5 + ts-mocha 11.1.0** | Yes | Matches Anchor 1.2.2's Mocha template |
| Test runner (unit) | **Vitest 5.1.0** | Yes | Vite-native; Node 26 compatible |

---

## 2. Toolchain

### 2.1 Rust

| Item | Value | Evidence |
|---|---|---|
| Proposed stable | **1.99.1** | `rust-lang/rust` latest release tag observed as `1.99.1` |
| Minimum supported by Anchor 1.2.2 | **1.89** | crates.io metadata for `anchor-lang` 1.2.2: `rust_version: 1.89` |
| Edition | **2021** | same metadata |
| Components | `rustfmt`, `clippy` | Required by the planned quality gates |

Why not a nightly? Anchor 1.2.2's AVM selects the pinned nightly it needs for IDL builds. The host stable toolchain is used for `cargo test`, `cargo fmt`, and `cargo clippy`. Do not force a global nightly.

`rust-toolchain.toml`:

```toml
[toolchain]
channel = "1.99.1"
components = ["rustfmt", "clippy"]
profile = "minimal"
```

### 2.2 Solana CLI / Agave

| Item | Value | Evidence |
|---|---|---|
| Proposed | **4.1.2** | Anchor 1.2.2 release notes: "The recommended Solana version is 4.1.2" |
| Platform tools | **v1.57** | same release notes |
| SBPF architecture | **v3** | same release notes |
| Install endpoint | `https://release.anza.xyz/v4.1.2/install` | HTTP 200 verified |

Do **not** install the `stable` channel blindly. The compatibility matrix maps `stable` to a newer line (4.3.x), and the latest Agave release observed was 4.4.1. Both are newer than the pairing Anchor 1.2.2 tests. The exact command is:

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v4.1.2/install)"
```

`solana-test-validator` ships with the Solana CLI. It is the validator used for integration tests via `anchor test --validator legacy`.

### 2.3 Anchor CLI and AVM

| Item | Value | Evidence |
|---|---|---|
| Anchor CLI | **1.2.2** | Anchor installation docs and GitHub release `v1.2.2` (2026-10-28) |
| AVM | install from `https://github.com/otter-sec/anchor` | Official Anchor installation docs |
| Anchor repository | `otter-sec/anchor` | Official docs and release assets |

Commands:

```bash
cargo install --git https://github.com/otter-sec/anchor avm --force
avm install 1.2.2
avm use 1.2.2
anchor --version   # anchor-cli 1.2.2
```

Do not use `anchor-lang` **2.0.0-rc.2**, which appears on crates.io as a pre-release. The stable CLI and docs are on the 1.2.x line.

### 2.4 Node.js, npm, and package manager

| Item | Installed | Proposed | Why |
|---|---|---|---|
| Node.js | **v26.13.0** | Keep **26.13.0** | Current LTS (Lithium, 2026-10-28); satisfies all proposed engine ranges |
| npm | **11.20.0** | Keep **11.20.0** | Already installed; native workspaces support |
| pnpm | Missing | **Not required** | Architecture doc proposed pnpm; npm workspaces avoids a global install |
| Yarn / Bun | Missing | **Not required** | No need to add a second package manager |
| Corepack | Missing | **Not required** | npm is used directly |

Node 26 is newer than the version shown in Anchor's installation example (Node 23.9.0). All declared engines accept it:

- `@anchor-lang/core@1.2.2`: `node >=20.18`
- Vite 7.3.7: `node ^20.19.0 || >=22.12.0`
- Vitest 5.1.0: `node ^22.12.0 || ^24.0.0 || >=26.0.0`
- Mocha 11.7.5: `node ^18.18.0 || ^20.9.0 || >=21.1.0`
- ESLint 10.14.0: `node ^20.19.0 || ^22.13.0 || >=24`

If Node 26 causes a tooling problem, the fallback is **Node 24.22.2** (latest observed 24.x LTS). That is an optional risk reduction, not a blocker.

**Package-manager decision:** use **npm workspaces**. The architecture document proposed `pnpm-workspace.yaml`, but pnpm is not installed. Adopting npm workspaces is a deliberate deviation that avoids adding a global tool. If pnpm is preferred, install `pnpm@12.18.0` and use `pnpm-workspace.yaml`; do not mix `package-lock.json` and `pnpm-lock.yaml`.

---

## 3. Rust crates

### 3.1 Program dependencies

```toml
[dependencies]
anchor-lang = { version = "=1.2.2", features = ["init-if-needed"] }
anchor-spl = { version = "=1.2.2", features = ["token", "associated_token"] }

[features]
default = []
cpi = ["no-entrypoint"]
no-entrypoint = []
no-log-ix-name = []
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]
```

| Crate | Version | Purpose |
|---|---|---|
| `anchor-lang` | `=1.2.2` | Program framework, account validation, CPI helpers, errors, events |
| `anchor-spl` | `=1.2.2` | SPL Token and Associated Token Account CPI helpers |
| `init-if-needed` feature | — | Allows the escrow ATA to be created if it does not already exist |
| `token` feature | — | Original SPL Token program only |
| `associated_token` feature | — | ATA creation/validation for escrow |

Rules:

- Keep `anchor-lang` and `anchor-spl` on the **exact same version** (`=1.2.2`). Anchor 1.2.2 tightens inter-crate pins; mixing patch versions is unsupported.
- Do **not** add `solana-program` as a direct dependency. Anchor 1.x uses granular `solana-*` crates internally. If a direct `solana-*` crate becomes necessary, keep it on the **3.x** line, which is Anchor 1.2.x's default `solana-v3` feature cohort.
- Do **not** enable the `solana-v4` feature. It is an opt-in experimental cohort for Anchor 1.2.1+ and is not part of the default CI/idl-build path.
- Do **not** enable `token_2022` or `spl-token-2022-interface`. The MVP is original SPL Token only.
- Commit `Cargo.lock`.

### 3.2 Optional Rust test dependencies

If Rust LiteSVM tests are approved, use the exact dependency set from Anchor 1.2.2's own LiteSVM template:

```toml
[dev-dependencies]
litesvm = "0.15.0"
solana-message = "4"
solana-transaction = "4"
solana-signer = "3"
solana-keypair = "3"
```

Notes:

- Anchor 1.2.2 release notes state that new Rust LiteSVM projects use **LiteSVM 0.15.0** with a Rust-1.89-compatible lockfile.
- `litesvm` 0.18.2 is the latest crate, but it is **not** the Anchor 1.2.2 template pin. Do not mix it in without re-testing the template.
- `anchor-litesvm` 0.4.0 exists, but the Anchor 1.2.2 v1 template uses `litesvm` directly. Do not add `anchor-litesvm` unless a concrete need appears.
- These Rust tests are optional. The primary gate is TypeScript integration testing against `solana-test-validator` (see `TECHNICAL_PLAN.md` §3).

---

## 4. TypeScript and frontend dependencies

### 4.1 Shared/runtime dependencies

| Package | Proposed version | Scope | Why / constraint |
|---|---|---|---|
| `@anchor-lang/core` | **1.2.2** | SDK, tests | Anchor 1.2.2 TypeScript client; replaces the old `@coral-xyz/anchor` package |
| `@solana/web3.js` | **1.99.0** | SDK, matcher, app, tests | Must be **1.x**; Anchor 1.2.2 client depends on `^1.69.1` |
| `@solana/spl-token` | **0.4.15** | tests, scripts | Test fixtures and demo mint creation; peer `@solana/web3.js ^1.95.5` |
| `bn.js` | **5.2.5** | SDK | u64 amounts as BN; no floating point |
| `@solana/wallet-adapter-base` | **0.9.28** | app | Wallet adapter primitives |
| `@solana/wallet-adapter-react` | **0.15.40** | app | React wallet context; peer web3.js `^1.99.0`, React `*` |
| `@solana/wallet-adapter-react-ui` | **0.9.40** | app | Wallet modal/button; peer web3.js `^1.99.0` |
| `@solana/wallet-adapter-wallets` | **0.19.40** | app | Wallet bundle for the demo; peer web3.js `^1.99.0` |
| `react` | **19.3.1** | app | Current stable |
| `react-dom` | **19.3.1** | app | Must match React |
| `vite` | **7.3.7** | app | Conservative stable major; Node 26 compatible |
| `@vitejs/plugin-react` | **5.2.0** | app | Supports Vite 7 and 8 |
| `vite-plugin-node-polyfills` | **0.28.0** | app | `Buffer`/`process` polyfills required by web3.js v1 in the browser |

### 4.2 TypeScript and test tooling

| Package | Proposed version | Scope | Why / constraint |
|---|---|---|---|
| `typescript` | **5.9.3** | all | Anchor 1.2.2's own Mocha template uses 5.9.3 |
| `mocha` | **11.7.5** | integration tests | `ts-mocha@11.1.0` supports Mocha `^11`, **not** Mocha 12 |
| `ts-mocha` | **11.1.0** | integration tests | Anchor 1.2.2 Mocha template stack |
| `ts-node` | **10.9.2** | integration tests | Required by `ts-mocha` |
| `chai` | **4.5.0** | integration tests | CJS-compatible; **chai 6 is ESM-only** and does not fit `ts-mocha` |
| `@types/mocha` | **10.0.10** | tests | Type definitions |
| `@types/chai` | **4.3.0** | tests | Type definitions |
| `@types/bn.js` | **5.2.0** | SDK/tests | Type definitions |
| `@types/node` | **26.6.6** | all | Matches Node 26 |
| `@types/react` | **19.3.0** | app | Type definitions |
| `@types/react-dom` | **19.3.0** | app | Type definitions |
| `vitest` | **5.1.0** | SDK/matcher unit tests | Vite-native; peer Vite `^6.4 || ^7 || ^8`; Node 26 compatible |
| `eslint` | **10.14.0** | all TS | Current stable; Node 26 compatible |
| `typescript-eslint` | **8.72.1** | all TS | Peer ESLint `^8.57 || ^9 || ^10`; peer TypeScript `>=4.8.4 <6.1` |
| `prettier` | **3.9.10** | all TS | Formatting |
| `tsx` | **4.23.15** | scripts/fallback | Run TS scripts and a fallback integration runner |

### 4.3 Root `package.json` sketch

```json
{
  "name": "circuit",
  "private": true,
  "workspaces": ["packages/*", "app", "tests"],
  "engines": {
    "node": ">=26.0.0",
    "npm": ">=11.0.0"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "prettier": "3.9.10",
    "eslint": "10.14.0",
    "typescript-eslint": "8.72.1",
    "tsx": "4.23.15"
  },
  "overrides": {
    "@solana/web3.js": "1.99.0",
    "bn.js": "5.2.5"
  }
}
```

The `overrides` block is important. `@anchor-lang/core` accepts web3.js `^1.69.1`; the wallet adapter requires `^1.99.0`. A single forced 1.99.0 copy avoids duplicate `PublicKey` classes and confusing runtime errors.

### 4.4 SDK package sketch

```json
{
  "name": "@circuit/sdk",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@anchor-lang/core": "1.2.2",
    "@solana/web3.js": "1.99.0",
    "bn.js": "5.2.5"
  },
  "devDependencies": {
    "@types/bn.js": "5.2.0",
    "typescript": "5.9.3"
  }
}
```

### 4.5 Integration test package sketch

```json
{
  "name": "@circuit/tests",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "test:integration": "ts-mocha -p ./tsconfig.json -t 1000000 \"tests/**/*.ts\""
  },
  "dependencies": {
    "@circuit/sdk": "0.0.0",
    "@circuit/matcher": "0.0.0",
    "@anchor-lang/core": "1.2.2",
    "@solana/web3.js": "1.99.0",
    "@solana/spl-token": "0.4.15"
  },
  "devDependencies": {
    "chai": "4.5.0",
    "mocha": "11.7.5",
    "ts-mocha": "11.1.0",
    "ts-node": "10.9.2",
    "@types/chai": "4.3.0",
    "@types/mocha": "10.0.10",
    "@types/node": "26.6.6",
    "typescript": "5.9.3"
  }
}
```

---

## 5. Compatibility evidence (checked, not assumed)

| Constraint | Observed evidence |
|---|---|
| Anchor 1.2.2 ↔ Solana CLI | Anchor 1.2.2 release notes: recommended Solana **4.1.2**, platform-tools **v1.57**, SBPF **v3** |
| Anchor 1.2.2 ↔ Rust | crates.io `anchor-lang` 1.2.2: `rust_version = 1.89`, `edition = 2021` |
| Anchor 1.2.2 ↔ Node | `@anchor-lang/core@1.2.2` engines: `node >=20.18` |
| Anchor 1.2.2 ↔ web3.js | `@anchor-lang/core@1.2.2` dependency: `@solana/web3.js ^1.69.1` |
| Wallet adapter ↔ web3.js | `@solana/wallet-adapter-react@0.15.40` peer: `@solana/web3.js ^1.99.0` |
| SPL Token client ↔ web3.js | `@solana/spl-token@0.4.15` peer: `@solana/web3.js ^1.95.5` |
| Vite 7 ↔ Node | `vite@7.3.7` engines: `node ^20.19.0 || >=22.12.0` |
| Vitest 5 ↔ Vite/Node | `vitest@5.1.0` peers Vite `^6.4 || ^7 || ^8`; engines `node ^22.12 || ^24 || >=26` |
| TS tooling ↔ TypeScript | `typescript-eslint@8.72.1` peer TypeScript `>=4.8.4 <6.1` |
| Mocha tooling ↔ Mocha | `ts-mocha@11.1.0` supports Mocha `^3`–`^11`; Mocha 12 is outside |
| glibc ↔ Anchor binary | Host glibc **2.43** ≥ Anchor 1.2.x requirement **2.39** |
| Anchor 1.2.2 test default | `anchor test` defaults to **surfpool**; `--validator legacy` selects `solana-test-validator` |
| Anchor LiteSVM template | Anchor 1.2.2 source: `litesvm = "0.15.0"`, `solana-message = "4"`, `solana-transaction = "4"` |

### 5.1 Why web3.js 1.99.0 and not 3.1.1

`@solana/web3.js` 3.1.1 is the latest npm package, but it is a different major line. The Anchor 1.2.2 TypeScript client, the SPL Token client, and the wallet adapter packages all target web3.js **1.x**. Installing web3.js 3.x would produce peer conflicts and/or duplicate types. Pin **1.99.0** and force it with npm `overrides`.

### 5.2 Why TypeScript 5.9.3 and not 7.0.2

TypeScript 7.0.2 is the latest npm `latest` tag, but `typescript-eslint@8.72.1` declares `typescript >=4.8.4 <6.1`. Anchor 1.2.2's own TypeScript template also uses 5.9.3. TS 7 can be evaluated later after the lint/type toolchain supports it. It is not required for the MVP.

### 5.3 Why Mocha 11.7.5 and not 12.0.3

`ts-mocha@11.1.0`, which is the Anchor 1.2.2 Mocha-template stack, declares Mocha `^3` through `^11`. Mocha 12 is outside that peer range. Pin 11.7.5.

### 5.4 Why chai 4.5.0 and not 6.3.0

Chai 5+ is ESM-only. `ts-mocha` runs in a CommonJS-oriented TypeScript test setup. Chai 4.5.0 is the CJS-compatible choice used by Anchor's template.

---

## 6. Explicitly rejected or deferred versions

| Package/version | Decision | Reason |
|---|---|---|
| `anchor-lang` **2.0.0-rc.2** | **Reject** | Pre-release; stable CLI/docs are 1.2.2; not for production MVP |
| `@solana/web3.js` **3.1.1** | **Reject** | Different major line; incompatible with Anchor 1.2.2 TS client and wallet adapter peers |
| Solana CLI **4.3.1** / Agave **4.4.1** | **Reject for now** | Newer than the Anchor 1.2.2 CI-tested pairing; not the version Anchor 1.2.2 recommends |
| `@coral-xyz/anchor` **0.32.1** | **Reject** | Old package name; Anchor 1.x uses `@anchor-lang/core` |
| Token-2022 / `spl-token-2022` | **Reject** | MVP is original SPL Token only |
| `chai` **6.3.0** | **Defer** | ESM-only; does not fit the `ts-mocha` CJS template |
| `mocha` **12.0.3** | **Defer** | Outside `ts-mocha@11.1.0` peer range |
| TypeScript **7.0.2** | **Defer** | `typescript-eslint` peer range is `<6.1`; toolchain not ready |
| Vite **8.3.6** | **Defer** | Stable, but Vite 7.3.7 is the conservative choice; revisit after a plugin smoke test |
| `litesvm` **0.18.2** | **Defer** | Latest crate, but Anchor 1.2.2's template pins 0.15.0 |
| `surfpool` **0.1.0** | **Defer** | Early crate; Anchor's default test validator requires a separate binary; use `--validator legacy` |
| `anchor-litesvm` **0.4.0** | **Defer** | Not used by Anchor 1.2.2's v1 LiteSVM template; adds an indirect litesvm 0.11 dependency |

---

## 7. Pinning and lockfile policy

1. **Exact versions only** for Anchor crates and TypeScript runtime/test dependencies. Avoid `^` and `~` in committed manifests.
2. Commit:
   - `Cargo.lock`
   - `package-lock.json`
   - `rust-toolchain.toml`
   - `.nvmrc`
   - `Anchor.toml`
3. Use `npm ci` in CI and clean installs, not `npm install`.
4. Use `cargo build --locked` / `anchor build` with the committed lockfile where possible.
5. Any `cargo update` or npm dependency bump requires a separate review and a new compatibility check.
6. Keep a single `@solana/web3.js` copy via npm `overrides`.
7. Do not install global npm packages for the build beyond npm itself. The Anchor CLI comes from AVM, not npm.

---

## 8. Sources checked (2026-11-06)

- Anchor installation guide: <https://www.anchor-lang.com/docs/installation>
- Anchor 1.2.2 release notes: <https://www.anchor-lang.com/docs/updates/release-notes/1-2-2>
- Anchor 1.2.2 GitHub release: <https://github.com/otter-sec/anchor/releases/tag/v1.2.2>
- Solana/Anchor compatibility matrix: <https://raw.githubusercontent.com/solana-foundation/solana-dev-skill/main/skills/solana-dev/references/compatibility-matrix.md>
- Anchor 1.2.2 CLI template source (test stack): <https://github.com/otter-sec/anchor/blob/v1.2.2/cli/src/template.rs>
- Anchor 1.2.2 CLI source (surfpool default and test environment): <https://github.com/otter-sec/anchor/blob/v1.2.2/cli/src/lib.rs>
- crates.io `anchor-lang` 1.2.2: <https://crates.io/api/v1/crates/anchor-lang/1.2.2>
- crates.io `anchor-spl` 1.2.2: <https://crates.io/api/v1/crates/anchor-spl/1.2.2>
- crates.io `litesvm` 0.18.2 and `anchor-litesvm` 0.4.0: <https://crates.io/crates/litesvm>, <https://crates.io/crates/anchor-litesvm>
- npm `@anchor-lang/core` 1.2.2: <https://www.npmjs.com/package/@anchor-lang/core/v/1.2.2>
- npm `@solana/web3.js` 1.99.0: <https://www.npmjs.com/package/@solana/web3.js/v/1.99.0>
- npm `@solana/spl-token` 0.4.15: <https://www.npmjs.com/package/@solana/spl-token/v/0.4.15>
- npm wallet adapter packages: <https://www.npmjs.com/package/@solana/wallet-adapter-react/v/0.15.40>, <https://www.npmjs.com/package/@solana/wallet-adapter-react-ui/v/0.9.40>, <https://www.npmjs.com/package/@solana/wallet-adapter-wallets/v/0.19.40>
- Node.js release index (LTS status): <https://nodejs.org/dist/index.json>
- Solana 4.1.2 install endpoint: <https://release.anza.xyz/v4.1.2/install>

Registry metadata proves that a version exists and what its declared peer/engine constraints are. It does **not** prove that the full stack builds together. Stage 1 must install the approved versions and run `anchor build`, `anchor test --validator legacy`, and the npm builds before the dependency baseline is considered verified in practice.

---

## 9. Approval checklist

Before Stage 1, approve or change:

- [ ] Rust **1.99.1** as the pinned stable toolchain.
- [ ] Solana CLI **4.1.2** (not `stable`).
- [ ] Anchor CLI/crates **1.2.2** (not 2.0 RC).
- [ ] Node **26.13.0** (or fallback Node 24.22.2).
- [ ] **npm workspaces** instead of pnpm.
- [ ] TypeScript **5.9.3** (not 7.0.2).
- [ ] web3.js **1.99.0** (not 3.x).
- [ ] Mocha **11.7.5** + `ts-mocha` **11.1.0** + chai **4.5.0** for integration tests.
- [ ] Vite **7.3.7** + `@vitejs/plugin-react` **5.2.0** (defer Vite 8).
- [ ] `anchor test --validator legacy` as the local test command.
- [ ] Optional Rust LiteSVM tests via `litesvm 0.15.0` only if the team wants them in addition to TS integration tests.

Once approved, these versions become the fixed dependency baseline for Stages 1–9 unless a documented compatibility issue requires a reviewed change.
