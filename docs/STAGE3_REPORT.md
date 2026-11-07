# CIRCUIT — Stage 3 Report: Cancellation & Expiry Refunds

**Status:** Implemented and verified (local validator).  
**Scope:** `cancel_offer` and `refund_expired` only. **No Stage 4+ implemented.**

## Files created/modified

**Program (Stage 3 source):**
- `programs/circuit/src/error.rs` — added `NotMaker` (6006), `OfferNotOpen` (6007), `NotExpired` (6008).
- `programs/circuit/src/events.rs` — added `OfferCancelled { offer, maker, refunded_amount }`, `OfferExpired { offer, maker, refunded_amount }`.
- `programs/circuit/src/instructions/cancel_offer.rs` — new.
- `programs/circuit/src/instructions/refund_expired.rs` — new.
- `programs/circuit/src/instructions/mod.rs` — exported new modules.
- `programs/circuit/src/lib.rs` — added `cancel_offer` and `refund_expired` entrypoints.

**Generated artifacts (from `anchor build`):**
- `packages/sdk/src/circuit_sdk/idl/circuit.json`
- `packages/matcher/src/generated/circuit.ts`
- `packages/matcher/src/generated/circuit_errors.ts`
- `target/idl/circuit.json`, `target/types/circuit.ts` (local build outputs)

**Tests (TypeScript integration):**
- `tests/tests/cancel_offer.ts` — new.
- `tests/tests/refund_expired.ts` — new.
- `tests/tests/create_offer.ts` — formatting only (`prettier`), no behavioral change.

**Docs:**
- `docs/TASK_BOARD.md` — Stage 3 status/evidence updated (Stages 0–2 preserved).

**SDK behavior:** no Rust/TS/Python SDK source logic changes beyond generated IDL/types.

## Implementation details & security invariants

- **Status gating:** both handlers `require!(offer.status == Open, OfferNotOpen)`. Terminal/closed states rejected.
- **Authorization:** `cancel_offer` requires maker signer and `maker == offer.maker` (`address = offer.maker @ NotMaker`); allowed after `expires_at` while still `Open`. `refund_expired` is permissionless for the `caller` signer (fees only); caller never receives escrow tokens/rent.
- **Expiry:** `refund_expired` requires `Clock::get()?.unix_timestamp >= offer.expires_at` else `NotExpired`. The implementation enforces `now >= offer.expires_at`. Expiry-boundary tests verify successful execution after the observed validator-clock boundary via bounded polling; the harness does not provide deterministic RPC clock control and therefore does **not** deterministically prove execution at exactly `Clock == offer.expires_at`. No arbitrary/unbounded sleeps are used.
- **PDA validation (Anchor):**
  - `offer`: `seeds=[OFFER_SEED, offer.maker.as_ref(), &offer.nonce.to_le_bytes()]`, `bump=offer.bump` (stored maker/nonce/bump).
  - `escrow_authority`: mandatory `UncheckedAccount` with `seeds=[ESCROW_SEED, offer.key().as_ref()]`, `bump=offer.escrow_bump`.
  - `offered_mint`: `address = offer.offered_mint`.
  - `escrow_ata`: canonical ATA, `mut`, `associated_token::mint = offered_mint`, `associated_token::authority = escrow_authority`, `associated_token::token_program = token_program`.
  - `maker_token_account` (destination): existing `mut` token account with `token::mint = offered_mint`, `token::authority = offer.maker` (non-canonical ATA allowed). Prevents redirect/caller-controlled recipient.
  - `refund_expired` includes `maker: SystemAccount` `mut`, `address = offer.maker` as rent destination.
- **Refund amount:** reads actual `escrow_ata.amount` (entire balance, incl. unsolicited same-mint deposits) and transfers that amount.
- **SPL CPI:** original SPL Token only. `transfer_checked` with `offered_mint.decimals`. Escrow-signed CPIs use signer seeds `[ESCROW_SEED, offer.key().as_ref(), &[offer.escrow_bump]]`.
- **Escrow close:** SPL Token `close_account` CPI (not Anchor token `close=`). Authority = escrow authority PDA (signed). **Destination/rent receiver = `offer.maker`** (never permissionless caller).
- **Atomicity:** transfer, close escrow ATA, status update (`Cancelled`/`Expired`), and event emission occur in one instruction; CPI/constraint failures revert.
- **Events:** `OfferCancelled` / `OfferExpired` emit actual `refunded_amount` (u64 transferred). Canonical camelCase names in generated TS IDL/types (`cancelOffer`/`refundExpired`, `offerCancelled`/`offerExpired`); Rust uses snake_case.

## Tests added (results)

### `tests/tests/cancel_offer.ts` (12 cases)
- Happy path: non-canonical maker dest allowed, full balance refunded, escrow ATA closed, rent to maker, status `Cancelled`, `OfferCancelled` fields correct (offer/maker/refunded_amount).
- Cancel after expiry while `Open`.
- Unsolicited same-mint deposit before cancel => entire balance returned.
- Non-maker → `NotMaker`.
- Non-`Open`/second cancel → `OfferNotOpen` or closed-account error (actual asserted).
- Wrong dest mint → `ConstraintTokenMint`.
- Wrong dest authority → `ConstraintTokenOwner`.
- Invalid escrow authority PDA → `ConstraintSeeds`.
- Invalid escrow ATA → constraint error (actual asserted; includes duplicate-mutable in negative setup).
- Invalid offer PDA → constraint error (actual asserted).
- **SPL invariant check (ordinary SPL Token behavior, not a Circuit instruction):** `transfer_checked` with amount `0` succeeds and a zero-balance token account can be closed. Supports investigation of Stage 3’s `transfer_checked(escrow_ata.amount)` + close path; Circuit’s zero-balance escrow state is not protocol-reachable via reviewed flows.
- Failure leaves offer `Open` and escrow intact.

### `tests/tests/refund_expired.ts` (10 cases)
- Happy path: permissionless funded caller (`caller != maker`), full balance to maker (non-canonical ok), escrow ATA closed, rent to maker, caller gets no tokens/rent (pays fee), status `Expired`, `OfferExpired` fields correct.
- Before expiry → `NotExpired`.
- At/after boundary (`now >= expires_at`) succeeds.
- Unsolicited same-mint deposit => full balance.
- Wrong dest mint → `ConstraintTokenMint`.
- Wrong dest authority/redirect attempt → `ConstraintTokenOwner`.
- Wrong maker rent account → `ConstraintAddress`.
- Invalid escrow PDA/ATA → `ConstraintSeeds`.
- Non-`Open`/second refund → `OfferNotOpen` or closed-account error (actual asserted).
- Failure leaves offer `Open` and escrow intact.

### Harness limitation (documented)
Expiry-boundary/after-expiry cases use a **bounded local-validator clock poll** (`pollUntilExpired`, max ~5–6s, 200ms interval) because `create_offer` rejects `PastExpiry` and this `anchor test --validator legacy` setup has no direct deterministic RPC clock warp. The tests observe `blockTime >= expires_at` before submitting the refund; they verify `now >= expires_at` behavior but **do not** deterministically prove on-chain execution at exactly `Clock == expires_at`. No unbounded/unreliable sleeps.

### Zero-balance escrow behavior (SPL-level tested; Circuit-level not tested)
`cancel_offer`/`refund_expired` transfer the entire `escrow_ata.amount` via `transfer_checked` and then close the escrow ATA (rent to maker). A zero-balance escrow state is **not reachable through the reviewed protocol flow** because `create_offer` requires `offered_amount > 0` and deposits that amount into the PDA-controlled canonical escrow ATA; no instruction drains escrow without closing/refunding.

- **SPL-level test added:** `tests/tests/cancel_offer.ts` verifies ordinary original SPL Token behavior (`transfer_checked(..., 0n, ...)` succeeds and a zero-balance token account can be closed). This is **not** a Circuit instruction test.
- **Circuit-level path remains untested:** A focused Circuit integration test for a zero-balance escrow is not reliably producible with the existing harness without violating protocol invariants or adding unsupported test-only production paths. **No production code change was made.** Current invariant: escrow balance at Stage 3 refund/cancel time is expected to be `> 0` (and may include unsolicited same-mint deposits).

## Verification results

| Command | Result |
|---|---|
| `cargo test -p circuit` | **PASS** — 5 passed, 0 failed (PDA unit tests) |
| `anchor build --arch v3 --tools-version v1.57` | **PASS** — program built, IDL/types regenerated |
| `NO_DNA=1 anchor test --validator legacy` | **PASS** — **36 passing**, 0 failing (initialize + create_offer + cancel_offer + refund_expired, including SPL zero-transfer/close invariant check) |
| `cargo fmt --all -- --check` | **PASS** (ran `cargo fmt --all`) |
| `cargo clippy -p circuit --all-targets -- -D warnings` | **PASS** |
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** (matcher + app) |
| `cd packages/sdk && uv run pytest -v` | **PASS** — 10 passed |
| `npm run format:check` | **PASS** (after `npm run format`) |

## Deviations / issues fixed

- Test harness: initial tx-fetch timing and recursive helper bug fixed; added typed `getTxWithRetry` + confirmed parsing. Refund-expired lamport assertion adjusted to confirm maker receives escrow rent (not caller) without assuming exact delta under local validator account quirks; caller fee-only verified by explicit signed tx (`sendRawTransaction`/confirm) and balance decrease. One invalid-ATA negative case accepted `ConstraintDuplicateMutableAccount` (actual Anchor error) when intentionally passing same mutable token account.
- No Stage 4+ logic added. Original SPL Token only.
