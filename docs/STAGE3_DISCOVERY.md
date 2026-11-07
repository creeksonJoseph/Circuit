# CIRCUIT — Stage 3 Discovery: Cancellation and Expiry Refunds

**Status:** Discovery approved (implementation not started).  
**Date:** 2026-11-07  
**Scope:** `cancel_offer` and `refund_expired` only.

**Explicitly out of scope:** settlement / Stage 4, partial fills, matcher, Token-2022, frontend, Devnet/mainnet, and any later-stage functionality.

## Approved decisions (user)

1. `cancel_offer`: **maker-only**. Cancellation is allowed **even after `expires_at`**, provided the offer is still `Open`.
2. `refund_expired`: **permissionless**. Anyone can submit the transaction and pay transaction fees.
3. Refund destination: an **existing** SPL token account **owned by `offer.maker`**, matching **`offer.offered_mint`**. It does **not** have to be the canonical ATA.
4. Refund amount: **entire escrow ATA balance**, including unsolicited tokens of the same mint.
5. Close the escrow ATA after refund. Send its **rent lamports to the maker**.
6. Recipient is **always `offer.maker`**, never the transaction caller.
7. Both instructions require **`OfferStatus::Open`**.
8. Expiry condition: **`Clock::get()?.unix_timestamp >= offer.expires_at`**.
9. Proposed errors (as implemented): **`NotMaker`, `OfferNotOpen`, `NotExpired`** (code 6008). (`NotExpired` was proposed as `OfferNotExpired` during discovery; implementation uses `NotExpired`.)
10. Events:
    - `OfferCancelled { offer, maker, refunded_amount }`
    - `OfferExpired { offer, maker, refunded_amount }`

## 1. Existing architecture findings (source-verified)

| Item | Source (actual) | Verified behavior |
|---|---|---|
| Program entrypoints | `programs/circuit/src/lib.rs:25-46` | Only `initialize` and `create_offer`. No cancel/refund/settle. |
| Offer state | `programs/circuit/src/state/offer.rs:5-20` | `Offer { version,bump,escrow_bump,status:OfferStatus,maker,nonce,offered_mint,requested_mint,offered_amount,requested_amount,created_at,expires_at }`, `#[account]`, `InitSpace`. |
| Status enum | `state/offer.rs:23-29` | `Open, Settled, Cancelled, Expired` exist. Stage 2 produces only `Open`; no transitions implemented. |
| Constants | `constants.rs:2,5,8,11` | `CONFIG_SEED=b"config"`, `PROTOCOL_VERSION=1`, `OFFER_SEED=b"offer"`, `ESCROW_SEED=b"escrow"`. |
| Offer PDA | `create_offer.rs:10-25,85,88-89` | `init`, seeds `[OFFER_SEED, maker.key(), &nonce.to_le_bytes()]`, `bump`; stores `offer.bump/maker/nonce`. |
| Escrow authority PDA | `create_offer.rs:16-17,38-44,86` | Declared **after** `offer`. `UncheckedAccount` with **mandatory** `seeds=[ESCROW_SEED, offer.key()]`, `bump`; not initialized. Stores `offer.escrow_bump`. |
| Escrow ATA | `create_offer.rs:46-53` | Canonical ATA `init_if_needed`: `associated_token::mint=offered_mint`, `associated_token::authority=escrow_authority`, `associated_token::token_program`. |
| Deposit CPI | `create_offer.rs:97-104` | `token::transfer_checked` maker→escrow ATA, explicit `offered_mint.decimals`. Atomic with init/state/event. |
| Mint source of truth | `create_offer.rs:27,29,62-67,90-91`, `lib.rs:31-44` | Args `(nonce,offered_amount,requested_amount,expires_at)` only. Stores mint keys from validated `Account<Mint>`. |
| Maker token account policy | `create_offer.rs:31-36` | `maker_offered_ata` is any maker-owned SPL token account for the offered mint (not canonical ATA). |
| Errors | `error.rs:5-23` | `Uninitialized, ZeroOfferedAmount, ZeroRequestedAmount, SameMint, PastExpiry, InsufficientBalance`. |
| Events | `events.rs:5-20` | `ProtocolInitialized`, `OfferCreated`. |
| PDA helpers | `pda.rs` | Deterministic/off-curve offer and escrow-authority PDA helpers. |
| Tests | `tests/tests/initialize.ts`, `tests/tests/create_offer.ts`, `docs/STAGE2_REPORT.md` | Stage 2 verified (14 integration cases; actual Anchor/custom errors asserted). |
| SDK | `packages/sdk/src/circuit_sdk/pda.py` | PDA helpers only (Solana-compatible via `solders`), uv-managed. No Stage 3 builders/decoders required. |

## 2. Account contexts and constraints (proposed)

### `cancel_offer` (maker-only)

| Account | Type / constraint (proposed) | Purpose / validation |
|---|---|---|
| `maker` | `Signer<'info>`, `mut` | Must equal `offer.maker` (`NotMaker`). Receives escrow ATA rent on close. |
| `offer` | `Account<'info, Offer>`, `mut`, `seeds=[OFFER_SEED, offer.maker.as_ref(), &offer.nonce.to_le_bytes()]`, `bump=offer.bump` | Validates Offer PDA against stored maker/nonce/bump. Require `status == Open` (`OfferNotOpen`). |
| `offered_mint` | `Account<'info, Mint>` | Must match `offer.offered_mint` (and provides `decimals` for `transfer_checked`). |
| `escrow_authority` | `UncheckedAccount` + **mandatory** `seeds=[ESCROW_SEED, offer.key().as_ref()]`, `bump=offer.escrow_bump` (canonical) | Validates PDA; used as CPI signer. Not initialized. |
| `escrow_ata` | `Account<'info, TokenAccount>`, `mut` | Canonical ATA for `(escrow_authority, offer.offered_mint)` with correct mint/authority. Source of refunded tokens; closed after transfer. |
| `maker_token_account` | `Account<'info, TokenAccount>`, `mut` | **Existing** account; `token::mint == offer.offered_mint`, `token::authority == offer.maker`. Not required to be canonical ATA. Recipient is always maker. |
| `token_program` | `Program<'info, Token>` | Original SPL Token only. |

No `init_if_needed` for destination (approved: existing account). No recipient argument.

### `refund_expired` (permissionless)

| Account | Type / constraint (proposed) | Purpose / validation |
|---|---|---|
| `caller` (or `payer` signer) | `Signer<'info>` | Pays transaction fees only. **Never** receives tokens/rent authority except tx fee role. |
| `offer` | `Account<'info, Offer>`, `mut`, PDA seeds+bump validated against stored maker/nonce/bump | Require `status == Open` and `Clock >= offer.expires_at` (`OfferNotOpen` / `NotExpired`). |
| `maker` | `UncheckedAccount` / validated recipient identity as needed | Must equal `offer.maker`; receives escrow ATA rent on close. |
| `offered_mint` | `Account<'info, Mint>` | Matches `offer.offered_mint`; decimals for `transfer_checked`. |
| `escrow_authority` | `UncheckedAccount` + mandatory `seeds=[ESCROW_SEED, offer.key().as_ref()]`, `bump=offer.escrow_bump` | PDA validation + CPI signer. |
| `escrow_ata` | `Account<'info, TokenAccount>`, `mut` | Canonical escrow ATA; full balance transferred; closed to maker. |
| `maker_token_account` | `Account<'info, TokenAccount>`, `mut` | Existing; mint=`offer.offered_mint`; authority=`offer.maker`. Recipient always maker. |
| `token_program` | `Program<'info, Token>` | Original SPL Token only. |

## 3. PDA validation and signer seeds

- **Offer PDA:** seeds `[OFFER_SEED, offer.maker.as_ref(), &offer.nonce.to_le_bytes()]`, bump `offer.bump` (stored at `create_offer.rs:85,88-89`). For existing accounts use Anchor `seeds`/`bump` constraints on the `Offer` account (or equivalent explicit derivation) so fabricated accounts are rejected.
- **Escrow authority PDA:** seeds `[ESCROW_SEED, offer.key().as_ref()]`, bump `offer.escrow_bump` (stored at `create_offer.rs:86`). Mandatory Anchor seeds+bump validation; not initialized.
- **CPI signer seeds:** `[ESCROW_SEED, offer.key().as_ref(), &[offer.escrow_bump]]` (or canonical bump from validated context; must match stored/canonical escrow bump).
- **Escrow ATA:** canonical ATA for `(escrow_authority PDA, offer.offered_mint)`; validate mint and authority match offer/escrow authority.

## 4. Instruction behavior (proposed)

### `cancel_offer`
1. Validate maker signer == `offer.maker` → `NotMaker`.
2. Validate `offer.status == Open` → `OfferNotOpen`. (Allowed after `expires_at` if still Open.)
3. Validate PDAs/accounts/mint as above.
4. Read `refunded_amount = escrow_ata.amount` (entire balance).
5. CPI `transfer_checked` (decimals from `offered_mint`) from `escrow_ata` to `maker_token_account`, signed by escrow authority PDA.
6. CPI `close_account` for `escrow_ata` with destination/rent receiver = `maker` (and authority escrow PDA).
7. Set `offer.status = OfferStatus::Cancelled`.
8. Emit `OfferCancelled { offer: offer.key(), maker: offer.maker, refunded_amount }`.
9. All steps atomic in one instruction.

### `refund_expired`
1. Validate `Clock::get()?.unix_timestamp >= offer.expires_at` → `NotExpired`.
2. Validate `offer.status == Open` → `OfferNotOpen`.
3. Validate PDAs/accounts/mint and that `maker_token_account.owner == offer.maker` and mint matches `offer.offered_mint`. Caller is irrelevant to recipient.
4. Read `refunded_amount = escrow_ata.amount` (entire balance).
5. CPI `transfer_checked` to `maker_token_account` signed by escrow authority PDA.
6. CPI `close_account` escrow ATA; rent lamports to `maker`.
7. Set `offer.status = OfferStatus::Expired`.
8. Emit `OfferExpired { offer: offer.key(), maker: offer.maker, refunded_amount }`.
9. Atomic.

## 5. State transitions

```text
                         cancel_offer (maker signer, Open)
Open ---------------------------------------------------------------------> Cancelled

Open -- refund_expired (permissionless caller, Open, now >= expires_at) --> Expired

Open -- settle_cycle (Stage 4 ONLY, future; out of scope) ---------------> Settled

Cancelled / Expired / Settled  ==> terminal (no further transitions)
```

## 6. Security analysis

| Threat | Protection |
|---|---|
| Non-maker cancels | `maker` signer + `require_keys_eq!(maker.key(), offer.maker)` → `NotMaker`. |
| Refund redirects funds | Destination authority/mint validated against `offer.maker` / `offer.offered_mint`; recipient always maker; no caller-controlled recipient. |
| Fabricated offer / wrong PDA | Anchor `Account<Offer>` + `seeds`/`bump` using stored `maker,nonce,bump`. |
| Wrong escrow authority | Mandatory seeds+bump `[ESCROW_SEED, offer.key()]`, `offer.escrow_bump`; used for `invoke_signed`. |
| Wrong escrow ATA / mint / token program | Canonical ATA + token/mint/authority constraints; `Program<Token>` (original SPL only). |
| Token-2022 | Typed SPL Token validation (Stage 2 policy). |
| Double refund / replay | `status == Open` required; terminal states rejected (`OfferNotOpen`). |
| Cancel vs refund race / concurrent tx | Solana executes tx atomically; first to transition from `Open` succeeds, second fails status/time checks. |
| Expiry boundary | `now >= expires_at` for `refund_expired`; `NotExpired` (code 6008) otherwise. Cancel allowed after expiry if still `Open`. |
| Insufficient escrow / unsolicited dust | Transfer **entire escrow ATA balance**; do not require exact `offered_amount`. Prevents dust-grief bricking. Closing ATA returns rent to maker. |
| Atomicity | Transfer, close, status update, and event occur in same instruction; CPI/constraint failure reverts all state changes. |

**Anchor provides:** account deserialization/ownership/type checks, SPL token/ATA constraints (as used), PDA seed/bump validation, signer enforcement. **Explicit logic required:** `NotMaker`, `OfferNotOpen`, `NotExpired` (code 6008), maker-as-recipient invariant, full-balance amount read, status transition, and correct close-account rent destination.

## 7. Test matrix (proposed for implementation)

### `cancel_offer`
- Happy path (Open, maker signs): full balance transferred to existing maker-owned token account (non-canonical allowed), escrow ATA closed, rent to maker, status `Cancelled`, `OfferCancelled` emitted; assert actual balances/status/event.
- Cancel allowed after `expires_at` if still `Open`.
- Non-maker signer → `NotMaker`.
- Status not `Open` (Cancelled/Expired/Settled if representable) → `OfferNotOpen`.
- Wrong maker token account owner/mint → constraint/custom error (assert actual).
- Wrong escrow authority/escrow ATA/mint → constraint error (assert actual).
- Unsolicited same-mint tokens in escrow → full balance refunded.
- Double cancel → second fails (`OfferNotOpen` / account-closed as applicable; assert actual).

### `refund_expired`
- Happy path after expiry (permissionless caller): full balance to maker-owned existing account, escrow ATA closed/rent to maker, status `Expired`, `OfferExpired` emitted.
- Before expiry (`now < expires_at`) → `NotExpired`.
- At/after boundary (`now >= expires_at`) → succeeds when `Open`.
- Caller != maker succeeds only when destination/recipient remains `offer.maker`.
- Wrong destination owner/mint or caller-controlled redirect attempt → fails (assert actual).
- Status not `Open` / double refund → fails.
- Wrong PDA/escrow accounts → fails.

### Common
- Assert **actual** Anchor/custom error codes/names (consistent with Stage 2 tests). Original SPL Token only. No Token-2022 cases added unless harness supports; rely on typed SPL constraints.

## 8. Implementation sequence (for a separate implementation instruction)

1. Add errors `NotMaker, OfferNotOpen, NotExpired` (`error.rs`) and events `OfferCancelled, OfferExpired` (`events.rs`).
2. Add `instructions/cancel_offer.rs` and `instructions/refund_expired.rs`; wire exports (`instructions/mod.rs`) and entrypoints (`lib.rs`).
3. Implement account contexts with PDA/bump/mint/token constraints and handlers (full-balance transfer, close escrow ATA to maker, status+event), preserving atomicity.
4. Add/adjust Rust PDA/helper unit tests only if pure helpers are introduced.
5. Add TS integration tests per matrix in `tests/tests/` (reuse existing setup patterns).
6. Run verification: `cargo test -p circuit`, `anchor build --arch v3 --tools-version v1.57`, `NO_DNA=1 anchor test --validator legacy`, `cargo fmt --all -- --check`, `cargo clippy -p circuit --all-targets -- -D warnings`, `npm run lint`, `npm run typecheck`, `npm run build`, `cd packages/sdk && uv run pytest -v`.
7. Update `docs/TASK_BOARD.md` (Stage 3 implementation evidence) and create Stage 3 report only after verified completion. **Do not start Stage 4.**

## 9. Notes / invariants

- `create_offer` sets `expires_at > now` (`create_offer.rs:80`); `refund_expired` uses `now >= expires_at`. Future settlement (Stage 4, out of scope) must use a non-overlapping rule (`now < expires_at`) as previously planned.
- No Rust, TypeScript, or Python source files were modified by this discovery step. No dependencies changed. No implementation performed.