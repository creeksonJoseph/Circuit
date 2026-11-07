# CIRCUIT — Task Board

| Stage | Status | Scope | Evidence |
|---|---|---|---|
| 0 | Complete | Technical discovery, dependency selection, structure proposal | `ENVIRONMENT_REPORT.md`, `TECHNICAL_PLAN.md`, `PROPOSED_DEPENDENCIES.md`, `PROPOSED_PROJECT_STRUCTURE.md` |
| 1 | Complete | Monorepo scaffold, Anchor program scaffold, local cluster, Python SDK scaffold, TypeScript matcher scaffold, React/JS frontend scaffold, lint/format/test setup | `STAGE1_REPORT.md`, `BUILD_AND_TEST.md` |
| 2 | Complete | Offer account, PDA, escrow-funded `create_offer` (original SPL only); Rust PDA tests; TS integration tests; Python SDK PDA helpers (Solana-compatible `is_on_curve` via `solders`) | `anchor build --arch v3 --tools-version v1.57` ✅; `cargo test -p circuit` (5 passed) ✅; `NO_DNA=1 anchor test --validator legacy` (14 passing) ✅; `cargo fmt --all -- --check` ✅; `cargo clippy -p circuit --all-targets -- -D warnings` ✅; `npm run lint` ✅; `npm run typecheck` ✅; `npm run build` ✅; `cd packages/sdk && uv run pytest -v` (10 passed) ✅; `cd packages/sdk && uv build --wheel` ✅ |
| 3 | Not started | Cancel and expiry refund | — |
| 4 | Not started | Atomic three-party settlement | — |
| 5 | Not started | Cycle matcher implementation | — |
| 6 | Not started | SDK implementation | — |
| 7 | Not started | React demo integration | — |
| 8 | Not started | Devnet deployment | — |
| 9 | Not started | Final security and integration review | — |

## Stage 2 notes
- `create_offer` args: `(nonce, offered_amount, requested_amount, expires_at)`; validated mint accounts are source of truth.
- `offer` PDA declared before `escrow_authority` PDA (seeds use `offer.key()`); `escrow_authority` is `UncheckedAccount` with mandatory Anchor `seeds=[ESCROW_SEED, offer.key()]` + `bump`; canonical bumps stored from `ctx.bumps`.
- Escrow ATA is canonical `init_if_needed` with authority = validated escrow authority PDA; `transfer_checked` uses `offered_mint.decimals`; operations are atomic with offer creation.
- Noncanonical escrow token account rejection asserted in integration tests (actual Anchor constraint error). No Stage 3+ functionality added.