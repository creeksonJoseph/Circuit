# CIRCUIT — Stage 4 Discovery: Offer Settlement (approved for implementation planning)

**Status:** Discovery approved (decisions recorded); **read-only feasibility review complete**. **No implementation yet.**  
**Date:** 2026-11-07 (corrected + approved + feasibility)  
**Scope:** `settle_cycle` over exactly 3 offers (atomic three-party settlement). No source/tests/deps/generated artifacts modified by this discovery.  
**Source of truth (inspected):** `docs/TASK_BOARD.md`, `docs/STAGE2_REPORT.md`, `docs/STAGE3_DISCOVERY.md`, `docs/STAGE3_REPORT.md`, `programs/circuit/src/{lib,error,events,constants,state,pda,instructions/*}`, generated IDL `packages/sdk/src/circuit_sdk/idl/circuit.json`, TS integration tests (`create_offer`, `cancel_offer`, `refund_expired`), `TECHNICAL_PLAN.md` (§2.5/§4.5, Stage 4/5), `ENVIRONMENT_REPORT.md`.

## Pre-implementation corrections (2026-11-07)

| # | Correction | Location | Before | After | Status |
|---|---|---|---|---|---|
| C1 | Account-layout heading count | §4 heading; §4.1 heading | “20 accounts + 3 offered mints optionality resolved” / “(20 accounts)” | “22 accounts” / “(22 accounts)” | Applied |
| C2 | Maker rent-recipient Anchor type | §4.1 rows 19-21; §4.3 aliasing row; §4.4 | `maker` described as `SystemAccount` constrained to `offer_x.maker` | Writable lamport rent-recipient `#[account(mut, address = offer_x.maker)]` (`/// CHECK:`); no unnecessary `SystemAccount` ownership restriction; SPL `close_account` needs only a writable lamport destination; rent → `offer_x.maker` invariant preserved | Applied |
| C3 | Decision 1 re-check | §2 | Option B | Confirmed unchanged: exact `offered_amount` to counterparty, excess to maker offered-mint token account, close escrow rent→maker, atomic | Verified, no change |

## 0) Approved scope and framing
- **Instruction:** **`settle_cycle` over exactly 3 offers** (atomic). Matches `docs/TASK_BOARD.md:9` and `TECHNICAL_PLAN.md`. **No bilateral settlement.**
- Cycle semantics apply per offer leg inside one atomic instruction.

## 1) Existing conventions to preserve (verified)
- Anchor 1.2.2 / Solana 4.1.2 / platform-tools v1.57 (SBPF v3); `NO_DNA=1 anchor test --validator legacy`; **original SPL Token only** (`Program<'info, Token>`).
- Seeds/constants: `CONFIG_SEED=b"config"`, `OFFER_SEED=b"offer"`, `ESCROW_SEED=b"escrow"`, `PROTOCOL_VERSION=1`.
- Offer PDA: `[OFFER_SEED, offer.maker, nonce_le_u64]`, stored `bump`. Escrow authority PDA: `[ESCROW_SEED, offer.key()]`, stored `escrow_bump`, `UncheckedAccount` with mandatory seeds+bump (Stage 3 pattern).
- Escrow ATA: canonical ATA for `(escrow_authority, offered_mint)`. Stage 3 closes escrow via SPL `close_account` signed by escrow PDA; **rent to maker**.
- Amounts `u64`; `transfer_checked` uses validated mint `decimals`. Statuses `Open,Settled,Cancelled,Expired`.
- Expiry: `create_offer` requires `expires_at > now`; `refund_expired` requires `now >= expires_at`; `cancel_offer` allowed after expiry if `Open`.
- Stage 2/3: maker token accounts may be non-canonical if `token::mint`/`token::authority` valid; escrow ATA canonical. TS tests assert actual Anchor/custom errors.

## 2) Approved decision 1 — Escrow balance treatment (CRITICAL)
**Approved: Option B.**
- For each offer leg: require `escrow_ata_x.amount >= offer_x.offered_amount` (reject if insufficient).
- Compute `excess_x = escrow_ata_x.amount - offer_x.offered_amount` (checked arithmetic).
- Transfer **exactly `offer_x.offered_amount`** of `offered_mint_x` from `escrow_ata_x` to the **mapped counterparty destination** (`transfer_checked`, decimals from validated `offered_mint_x`, signed by `escrow_authority_x` PDA).
- If `excess_x > 0`: transfer **exactly `excess_x`** of `offered_mint_x` from `escrow_ata_x` to **`maker_excess_refund_x`** (existing maker-owned token account for `offered_mint_x`) via `transfer_checked`, signed by `escrow_authority_x` PDA. If `excess_x == 0`, skip.
- Close `escrow_ata_x` via SPL `close_account` (authority `escrow_authority_x` PDA); **rent → `offer_x.maker`**. Final balance is 0.
- All atomic in `settle_cycle`. Counterparty **never** receives excess. Strict equality policy **withdrawn** (DoS/liveness: predictable escrow ATA + unsolicited deposits; `init_if_needed` may coexist with pre-existing balance).

**`maker_excess_refund_x` constraints (approved):** existing token account, `token::mint == offer_x.offered_mint`, `token::authority == offer_x.maker` (non-canonical acceptable). **Do not initialize** inside settlement.

## 3) Three-offer cycle mapping (unambiguous, approved)

| Offer | Maker | Offers (mint) | Requests (mint) | Escrow holds |
|---|---|---|---|---|
| **A** | `maker_A = offer_a.maker` | `X = offer_a.offered_mint` | `Y = offer_a.requested_mint` | `offer_a.offered_amount` of `X` (+ any unsolicited excess) |
| **B** | `maker_B = offer_b.maker` | `Y = offer_b.offered_mint` | `Z = offer_b.requested_mint` | `offer_b.offered_amount` of `Y` (+ excess) |
| **C** | `maker_C = offer_c.maker` | `Z = offer_c.offered_mint` | `X = offer_c.requested_mint` | `offer_c.offered_amount` of `Z` (+ excess) |

### Agreed trade transfers (exact `offered_amount` only)
| Source escrow | Mint | Amount | Destination (receives agreed trade) | Destination authority | Destination mint |
|---|---|---:|---|---|---|
| `escrow_ata_a` | `X` | `offer_a.offered_amount` | **`dest_c_receives_x`** | `maker_C` | `X == offer_c.requested_mint` |
| `escrow_ata_b` | `Y` | `offer_b.offered_amount` | **`dest_a_receives_y`** | `maker_A` | `Y == offer_a.requested_mint` |
| `escrow_ata_c` | `Z` | `offer_c.offered_amount` | **`dest_b_receives_z`** | `maker_B` | `Z == offer_b.requested_mint` |

### Excess refunds (Option B, if `excess_x > 0`)
| Source escrow | Mint | Amount | Destination | Authority | Mint |
|---|---|---:|---|---|---|
| `escrow_ata_a` | `X` | `escrow_ata_a.amount - offer_a.offered_amount` | **`excess_refund_a`** | `maker_A` | `X == offer_a.offered_mint` |
| `escrow_ata_b` | `Y` | excess B | **`excess_refund_b`** | `maker_B` | `Y` |
| `escrow_ata_c` | `Z` | excess C | **`excess_refund_c`** | `maker_C` | `Z` |

### Amount/cycle constraints (enforce)
- `offer_a.requested_amount == offer_b.offered_amount`
- `offer_b.requested_amount == offer_c.offered_amount`
- `offer_c.requested_amount == offer_a.offered_amount`
- `offer_a.requested_mint == offer_b.offered_mint` (`Y`)
- `offer_b.requested_mint == offer_c.offered_mint` (`Z`)
- `offer_c.requested_mint == offer_a.offered_mint` (`X`)

## 4) Final account layout (feasibility) — **22 accounts**

### 4.1 Recommended complete layout (22 accounts)
Use **explicit, role-based names**. Order is fixed by IDL/client convention but mapping must be documented; recommended grouping: offers, offered mints, escrow authorities, escrow ATAs, counterparty destinations, maker excess refunds, maker rent recipients, token program.

| # | Name | Mut | Signer | Type / validation (intent) |
|---:|---|:---:|:---:|---|
| 1 | `offer_a` | ✓ | — | `Account<Offer>`, PDA `[OFFER_SEED, offer_a.maker, nonce_le]`, `bump=offer_a.bump`, `status==Open`, `now < expires_at`. |
| 2 | `offer_b` | ✓ | — | same for B |
| 3 | `offer_c` | ✓ | — | same for C |
| 4 | `mint_x` | — | — | `Account<Mint>` == `offer_a.offered_mint` (X); decimals for escrow A transfers. |
| 5 | `mint_y` | — | — | == `offer_b.offered_mint` (Y) |
| 6 | `mint_z` | — | — | == `offer_c.offered_mint` (Z) |
| 7 | `escrow_authority_a` | — | — | `UncheckedAccount` PDA `[ESCROW_SEED, offer_a.key()]`, `bump=offer_a.escrow_bump`. |
| 8 | `escrow_authority_b` | — | — | same for B |
| 9 | `escrow_authority_c` | — | — | same for C |
| 10 | `escrow_ata_a` | ✓ | — | Canonical ATA: mint `mint_x`, authority `escrow_authority_a`, SPL Token. Source escrow for X. |
| 11 | `escrow_ata_b` | ✓ | — | mint `mint_y`, authority `escrow_authority_b` |
| 12 | `escrow_ata_c` | ✓ | — | mint `mint_z`, authority `escrow_authority_c` |
| 13 | `dest_c_receives_x` | ✓ | — | Existing token acct: `mint == X == offer_c.requested_mint`, `authority == maker_C`. Receives `offer_a.offered_amount` from escrow A. |
| 14 | `dest_a_receives_y` | ✓ | — | `mint == Y == offer_a.requested_mint`, `authority == maker_A`. Receives from escrow B. |
| 15 | `dest_b_receives_z` | ✓ | — | `mint == Z == offer_b.requested_mint`, `authority == maker_B`. Receives from escrow C. |
| 16 | `excess_refund_a` | ✓ | — | Existing token acct: `mint == X == offer_a.offered_mint`, `authority == maker_A`. Receives excess from escrow A (Option B). |
| 17 | `excess_refund_b` | ✓ | — | `mint == Y`, `authority == maker_B` |
| 18 | `excess_refund_c` | ✓ | — | `mint == Z`, `authority == maker_C` |
| 19 | `maker_a` | ✓ | — | Rent recipient (writable lamport destination) for closing `escrow_ata_a`; `#[account(mut, address = offer_a.maker)]` (`/// CHECK:` info account; **no `SystemAccount` ownership restriction** — SPL `close_account` requires only a writable lamport destination). Must equal `offer_a.maker`. See §4.4. |
| 20 | `maker_b` | ✓ | — | `#[account(mut, address = offer_b.maker)]` rent recipient; writable lamport destination; must equal `offer_b.maker`. No `SystemAccount` restriction. |
| 21 | `maker_c` | ✓ | — | `#[account(mut, address = offer_c.maker)]` rent recipient; writable lamport destination; must equal `offer_c.maker`. No `SystemAccount` restriction. |
| 22 | `token_program` | — | — | `Program<Token>` (SPL Token). |

**Count:** 22 accounts total (21 named above + token program = 22). This is **feasible** (well under typical Solana instruction/account limits for legacy tx metadata; must be verified by logging serialized tx size in tests, as TECHNICAL_PLAN requires for `settle_cycle`). If maker rent recipients can be safely derived/aliased without adding ambiguity, count may reduce (see §4.4), but explicit maker accounts are simplest/clearest.

**Offered mints:** 3 mint accounts (`mint_x/y/z`) are **recommended** so `transfer_checked` uses validated decimals for each escrow leg (escrow A/B/C transfer X/Y/Z). Requested mints (`Y,Z,X`) are the same set; cycle constraints can be validated against stored `offer_x.requested_mint` keys plus equality to corresponding offered mints — no extra mint accounts required.

### 4.2 Transaction-size implications
- **Account metas:** ~22 accounts × 34 bytes (pubkey+flags) in legacy message = ~748 bytes for metas alone, plus header/blockhash/instruction data/compiled instructions — **likely under 1232 bytes** but **must be measured** (TECHNICAL_PLAN: “Log serialized message size for `settle_cycle`; assert < 1232 bytes for a legacy transaction”).
- **Instruction data:** discriminator + no args expected (all amounts from validated offers) → minimal.
- **Compute:** 3×(1–2 transfers + 1 close) + status/event writes — multiple SPL CPIs; log compute units in tests (TECHNICAL_PLAN Stage 4 gate).
- **Risk:** if address lookup tables (ALT) are not used (MVP/local-first), legacy tx size is the binding constraint. 22 accounts should fit; adding more accounts increases risk. **Blocker to confirm in implementation tests:** serialized size and CU.

### 4.3 Destination/refund/maker aliasing — safe vs must reject
**Approved principle:** enforce documented distinct offer/maker/offered-mint requirements; add aliasing checks **only where reuse creates genuine security or correctness issue**. Do not reject harmless aliasing without justification.

| Potential aliasing | Safe? | Recommendation |
|---|---:|---|
| `offer_a/b/c` same pubkey | **No** | Must reject (documented distinct offers; also impossible for different makers/nonces in normal use; defensive). |
| `maker_a/b/c` resolve to same pubkey as another maker | **No** | Must reject (TECHNICAL_PLAN §2.5/§4.5: distinct makers). |
| `mint_x/y/z` pairwise not distinct | **No** | Must reject (TECHNICAL_PLAN §2.5/§4.5: offered mints pairwise distinct). |
| `escrow_ata_x` same as `dest_*` or `excess_refund_*` | **No** | Must reject by constraints (escrow ATA authority is escrow PDA; dest/excess authority is maker). Genuine security/correctness issue. |
| `dest_c_receives_x` (mint X, authority maker_C) aliases `excess_refund_a` (mint X, authority maker_A)? | **Only if same token account** — impossible when authorities differ (`maker_C != maker_A`) unless account constraints are bypassed; **reject/let constraints fail**. If someone passes same pubkey, token owner/mint/authority constraints or explicit key-inequality checks will prevent unsafe behavior. |
| `dest_c_receives_x` (mint X, maker_C) aliases `excess_refund_c` (mint Z, maker_C)? | Different mints (`X != Z` by cycle) — cannot be the same SPL token account; **reject by mint constraint** (genuine correctness). |
| `excess_refund_x` aliases counterparty `dest_*` for a **different mint** | Cannot satisfy mint constraints; safe to reject by constraints. |
| `excess_refund_a` used as both counterparty dest? | No — mapping requires `dest_c_receives_x` (authority maker_C) vs `excess_refund_a` (authority maker_A); authorities differ. |
| Same physical token account passed as `excess_refund_a` and also acceptable for another role? | **Harmless in rare cases is not the default;** prefer explicit role separation. Only allow aliasing where it cannot violate `mint`/`authority`/PDA/escrow invariants. In practice, distinct roles have different required mints/authorities in this cycle. |
| `maker_a` (rent recipient account) aliases `maker_b` | **No** — makers must be distinct (documented). |
| `maker_a` rent recipient passed as same pubkey as `excess_refund_a`? | `maker_a` is a writable lamport rent-recipient account constrained to `offer_a.maker`; `excess_refund_a` is an **SPL TokenAccount**. They are different accounts/types in normal flow. Do not force aliasing; explicit accounts are clear. |

**Conclusion:** Rely on **strong existing-style constraints** (PDA seeds/bump, ATA/canonical escrow, `token::mint`, `token::authority`, `address == offer_x.maker`) and the **documented uniqueness checks** (distinct offer keys, makers, offered mints). Add explicit key-equality rejection only when a constraint does not already prevent a genuine security/correctness issue. Avoid blanket “all 22 pubkeys unique” unless justified.

### 4.4 Maker rent-recipient Anchor type
- **Anchor representation:** `/// CHECK:` writable lamport rent-recipient account constrained `#[account(mut, address = offer_x.maker)]`. SPL `close_account` requires only a writable lamport destination — **not** a system-owned account — so do **not** impose `SystemAccount<'info>` on `maker_a/b/c`; that would unnecessarily restrict which accounts can receive rent. The invariant (rent → `offer_x.maker`) is preserved by the `address = offer_x.maker` constraint.
- **Stage 3 evidence:** rent destination = `offer.maker` in both `cancel_offer` (`maker`: `Signer`, `mut`) and `refund_expired` (`maker`: `SystemAccount`, `mut`); both pass `ctx.accounts.maker.to_account_info()` as the close destination without an ownership restriction on the close itself.
- **Feasibility:** one explicit rent-recipient account per maker (`maker_a/b/c`, `mut`, constrained to `offer_x.maker`) is sufficient; no duplicate “maker identity” account is needed beyond one per maker.
- **Can we omit separate maker accounts?** Only if an already-passed writable account is guaranteed to be `offer_x.maker` and safe to receive rent — risky/ambiguous since role-based token accounts are SPL token accounts, not maker accounts. **Recommendation:** keep explicit `maker_a/b/c` rent-recipient accounts (3 accounts) constrained to `offer_x.maker`, `mut`. Small overhead, removes ambiguity. (Count remains 22 with token program.)

### 4.5 Remaining technical blockers / undocumented assumptions
1. **Serialized tx size / CU (must verify in implementation):** 22-account layout likely fits legacy tx; **not proven until measured**. If too large, consider ALT (v0 tx) — would be a scope/tooling decision.
2. **Anchor account constraints for “existing token account, no init”:** must use `Account<'info, TokenAccount>` with `token::mint`/`token::authority` checks only (no `init`, no `init_if_needed`) for `dest_*` and `excess_refund_*` — consistent with Stage 3. **Confirmed pattern exists.**
3. **Event/excess field shape:** approved that `CycleSettled` must distinguish agreed settlement amounts from excess refunds and include excess-refunded amounts — exact field names/types need implementation-time IDL consistency (Decision 7).
4. **Error set/naming/codes:** settlement-specific errors to be added; tests must assert actual codes (Decision 7).
5. **Exact-boundary/expiry testing:** same harness limitation as Stage 3 (bounded clock polling; `now < expires_at` boundary `==` not deterministically proven) — document, do not claim exact boundary proof unless achieved.
6. **Unsigned fee payer:** permissionless submission means any tx fee payer signs; instruction must not require maker/taker signatures (consistent with plan/Stage 3 permissionless pattern).

## 5) Approved decisions summary (all recorded)
1. **Escrow balance (Option B, approved):** `escrow_ata.amount >= offer.offered_amount`; transfer exact `offered_amount` to counterparty; refund `excess` (if any) to maker’s existing offered-mint token account (mint/authority constrained); close escrow; rent to maker; atomic. Counterparty never receives excess.
2. **Scope:** `settle_cycle` over exactly 3 offers. No bilateral settlement.
3. **Destinations:** existing token accounts; validate mint+authority; non-canonical acceptable; **no init inside settlement**.
4. **Escrow closure:** close all 3 escrow ATAs after balances reach 0; rent to corresponding offer maker.
5. **Expiry:** every offer `Clock::get()?.unix_timestamp < offer.expires_at`.
6. **Uniqueness/aliasing:** enforce documented distinct offer, maker, offered-mint requirements (TECHNICAL_PLAN §2.5/§4.5); add aliasing checks only where reuse creates genuine security/correctness issue.
7. **Errors/events:** clear settlement-specific errors; `CycleSettled` must distinguish agreed settlement amounts from excess refunds and include excess-refunded amounts.

## 6) Feasibility verdict
- **Account layout:** feasible at **22 accounts** (explicit, unambiguous A/B/C mapping). Maker rent recipients are explicit (no unsafe reuse required).
- **Security/correctness:** Option B eliminates strict-equality DoS and prevents taker inflation/stranded funds when constraints/atomicity hold.
- **Primary remaining confirmations (implementation-time, measured):** legacy tx serialized size < 1232 bytes and CU within limits; concrete error/event names/codes; any aliasing guard that constraints do not already cover.
- **No Rust/tests/IDL/SDK/deps/generated artifacts modified.** Stage 4 **not implemented**. Do not proceed to Stage 5.
