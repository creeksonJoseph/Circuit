# CIRCUIT — Stage 2 Report (Audit + SDK Fix)

**Stage:** 2 — Offer accounts and PDA-controlled escrow  
**Date:** 2026-11-07  
**Status:** Implementation complete; Stage 2 acceptance checks verified (see evidence). Audit-only for Rust/TS; Python SDK received a targeted fix for `_is_on_curve` reliability and uv migration.

## 1. Scope implemented (per approved plan)
- `Offer` + `OfferStatus` (`Open, Settled, Cancelled, Expired`) with `8 + Offer::INIT_SPACE`.
- `create_offer(nonce, offered_amount, requested_amount, expires_at)` only; validated mint accounts are the source of truth for stored mint keys.
- `offer` PDA declared before `escrow_authority`; canonical bumps stored from `ctx.bumps.offer` / `ctx.bumps.escrow_authority`.
- `escrow_authority` is `UncheckedAccount` with **mandatory** Anchor PDA validation (`seeds=[ESCROW_SEED, offer.key()]`, `bump`); not initialized; no allocated account/owner.
- Escrow ATA is canonical `init_if_needed` with authority = validated escrow authority PDA and mint = `offered_mint`; pre-created correct canonical ATA reused safely.
- `transfer_checked` CPI moves exact `offered_amount` with explicit `offered_mint.decimals`; maker signs; operations atomic with offer creation.
- Original SPL Token typed validation (`Account<Mint>`/`Account<TokenAccount>`, `Program<Token>`); Token-2022 rejected by typed validation. No cancel/refund/settle/Stage 3+.
- Python SDK: PDA helpers only (`find_offer_address`, `find_escrow_authority_address`) + seeds; no `decode_offer`/builders.

## 2. Python SDK `_is_on_curve` / uv fix (this pass)
**Issue (audit):** `packages/sdk/src/circuit_sdk/pda.py` previously caught missing `nacl` and silently treated points as off-curve (`return False`), which is not a reliable curve check.

**Compatibility investigation (Solana vs libsodium):**
- Solana `is_on_curve` / `bytes_are_curve_point` semantics are `curve25519_dalek::edwards::CompressedEdwardsY::decompress().is_some()` (accepts any point on the edwards curve that decompresses).
- `nacl.bindings.crypto_core_ed25519_is_valid_point` (libsodium) is stricter: it additionally enforces canonical encoding and main-subgroup/small-order rejection.
- **Differential evidence (solders as Solana-compatible reference):** comparing against `solders.Pubkey.from_bytes(...).is_on_curve()` (Solana Rust bindings) over 775 deterministic 32-byte inputs (including edge encodings and hash-derived bytes) found **297 disagreements** where `crypto_core_ed25519_is_valid_point` returned `False` but `solders/Solana` returned `True` (e.g., `0000..00`, `0100..00`).
- **PDA impact:** for `find_program_address` candidates, any disagreement where Solana considers a candidate on-curve but libsodium rejects it would cause our code to accept a PDA that Solana would reject — **incorrect PDA derivation**. Repro: for seeds `[b"offer", bytes(32), (7).to_le_bytes()]` with program `4Jr3Ptxa...PNhc`, the libsodium-based path selected bump 255 / address `767f...` but `solders.is_on_curve(767f...) == True` and `solders.find_program_address` returned bump 254 / address `9fec...`.

**Fix (Python-only; API preserved):**
- `_is_on_curve` now delegates to `solders.Pubkey.from_bytes(pubkey_bytes).is_on_curve()` for **exact Solana-compatible semantics**.
- If `solders` is unavailable, it raises a clear, actionable `RuntimeError` (mentions `solders is required`, `circuit_sdk.pda`, and install guidance including `cd packages/sdk && uv sync` / `pip install solders==0.27.1`). **No silent `False` fallback.**
- `packages/sdk/pyproject.toml`: pins `solders==0.27.1`. PyNaCl was found unused in SDK source/tests and removed; `packages/sdk/uv.lock` regenerated via `uv lock`/`uv sync`.
- `packages/sdk/tests/test_sdk.py`: normal curve-check behavior, missing-`solders` test (clear `RuntimeError`), differential curve-check test vs `solders.Pubkey.is_on_curve`, and PDA derivation equivalence test vs `solders.Pubkey.find_program_address` (deterministic vectors, including real program ID).

**uv migration (Python SDK):** `uv.lock` present; dependencies resolved/installed with uv. Tests/build run with uv (`uv run pytest`, `uv build --wheel`). `AGENTS.MD` updated to state uv-only for Python SDK (no `pip`/`python3 -m venv`).

## 3. Python SDK test evidence
**Command (uv, complete suite):** `cd /home/creeksonjoseph/softwarengineering/personal_projects/circuit/packages/sdk && uv run pytest -v`  
**Exit code:** `0`  
**Result:** `10 passed in 0.10s` (0 failed, 0 skipped). Includes differential curve-check vs `solders.Pubkey.is_on_curve` and PDA derivation equivalence vs `solders.Pubkey.find_program_address`.

**Command (venv, complete suite):** `/home/creeksonjoseph/softwarengineering/personal_projects/circuit/packages/sdk/.venv/bin/python -m pytest -v /home/creeksonjoseph/softwarengineering/personal_projects/circuit/packages/sdk/tests`  
**Exit code:** `0`  
**Result:** `10 passed in 0.07s`.

**Build (uv):** `cd packages/sdk && uv build --wheel` → `Successfully built dist/circuit_sdk-0.1.0-py3-none-any.whl` (exit 0).

## 4. Full acceptance checks (verified)
| Check | Command | Result |
|---|---|---|
| Anchor build | `anchor build --arch v3 --tools-version v1.57` | Exit 0 |
| Rust unit tests | `cargo test -p circuit` | Exit 0; 5 passed, 0 failed |
| Anchor integration | `NO_DNA=1 anchor test --validator legacy` | Exit 0; **14 passing** (`create_offer` 12 + scaffold 2) |
| Rust fmt | `cargo fmt --all -- --check` | Exit 0 |
| Clippy | `cargo clippy -p circuit --all-targets -- -D warnings` | Exit 0 |
| Lint | `npm run lint` | Exit 0 |
| Typecheck | `npm run typecheck` | Exit 0 |
| Build | `npm run build` | Exit 0 |
| Python SDK tests | `cd packages/sdk && uv run pytest -v` | Exit 0; 10 passed |

## 5. Files changed (SDK curve-check compatibility + cleanup pass)
- `packages/sdk/src/circuit_sdk/pda.py` — `is_on_curve` delegates to `solders.Pubkey.from_bytes(...).is_on_curve()` for Solana-compatible semantics; clear `RuntimeError` if `solders` missing.
- `packages/sdk/pyproject.toml` — pins `solders==0.27.1` (sole runtime dep for PDA curve checks); PyNaCl removed after confirming it is unused in SDK source/tests.
- `packages/sdk/uv.lock` — regenerated.
- `packages/sdk/tests/test_sdk.py` — normal behavior, missing-`solders` error, differential vs `solders.Pubkey.is_on_curve`, PDA equivalence vs `solders.Pubkey.find_program_address`.
- `AGENTS.MD` — uv-only SDK commands/rule.
- `docs/STAGE2_REPORT.md` — corrected to reflect actual `solders` implementation, test counts, and dependency state.
- `docs/TASK_BOARD.md` — Stage 2 evidence updated (10 passed); earlier stage statuses preserved.

## 6. Remaining limitations (factual)
- `create_offer` IDL/test uses `accountsStrict` with canonical ATA; TS integration asserts actual constraint codes where Anchor ordering varies (noncanonical escrow ATA passed with observed constraint error).
- `maker_offered_ata` may be any maker-owned token account for the correct mint (not required canonical ATA), as approved.
- No cancellation/refund/settlement (Stage 3/4), no SDK `decode_offer`/builders, no Devnet/mainnet work.
- Python SDK requires `solders` (declared, pinned) for Solana-compatible `is_on_curve`/PDA semantics; environments without it get an actionable `RuntimeError` (intentional; safe). PyNaCl is not used by SDK source/tests and was removed from SDK runtime dependencies.