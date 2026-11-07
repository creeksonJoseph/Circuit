# CIRCUIT — Stage 4 Report: Atomic Three-Party Settlement (`settle_cycle`)

**Status:** Implemented and verified (local validator).  
**Scope:** `settle_cycle` over exactly 3 offers (atomic). **No Stage 5+ implemented.**

## Approved semantics (implemented)
- **Option B (escrow/excess):** for each leg require `escrow_ata.amount >= offer.offered_amount`; transfer **exactly `offer.offered_amount`** to the mapped counterparty destination (`transfer_checked`, validated mint decimals, escrow PDA signer); if excess > 0 transfer exact excess to an **existing maker-owned offered-mint token account** (`token::mint == offer.offered_mint`, `token::authority == offer.maker`, non-canonical ok, no init in settlement); close escrow ATA via SPL `close_account` signed by escrow PDA; **rent → corresponding `offer.maker`** (writable lamport destination constrained to maker, no unnecessary `SystemAccount` ownership restriction). All atomic. Counterparty never receives excess.
- **A/B/C mapping:** A offers X requests Y → `escrow_ata_a`(X, `offer_a.offered_amount`) to `dest_c_receives_x` (mint X, authority maker C); B offers Y requests Z → `escrow_ata_b` to `dest_a_receives_y` (authority maker A); C offers Z requests X → `escrow_ata_c` to `dest_b_receives_z` (authority maker B). Excess refunded to `excess_refund_a/b/c` (offered mint, maker authority). Amount constraints: `A.req==B.off`, `B.req==C.off`, `C.req==A.off`. Mint constraints: `A.req==B.off_mint(Y)`, `B.req==C.off_mint(Z)`, `C.req==A.off_mint(X)`.
- **Guards:** all offers `Open` (`OfferNotOpen`) and `Clock < expires_at` (`SettlementExpired`; boundary `==` not settleable). Distinct offer keys/makers/offered mints enforced (`DuplicateOffer`/`DuplicateMaker`/`DuplicateOfferedMint`); PDA seeds+bump, canonical escrow ATAs, destination/excess mint+authority, escrow authority PDAs, and Anchor duplicate-mutable constraints reject unsafe aliasing.

## Files created/modified
**Program (Stage 4 source):**
- `programs/circuit/src/instructions/settle_cycle.rs` — new (22-account `SettleCycle`, Option B, `Box<Account<...>>` + `#[inline(never)] settle_leg` to satisfy exact SBF v3 build stack limits).
- `programs/circuit/src/error.rs` — `SettlementExpired` (6009), `InsufficientEscrowBalance` (6010), `InvalidSettlementCycle` (6011), `DuplicateOffer` (6012), `DuplicateMaker` (6013), `DuplicateOfferedMint` (6014).
- `programs/circuit/src/events.rs` — `CycleSettled` with `offer_a/b/c, maker_a/b/c, mint_x/y/z, agreed_amount_a/b/c, excess_refunded_a/b/c`.
- `programs/circuit/src/instructions/mod.rs`, `programs/circuit/src/lib.rs` — wired `settle_cycle`.

**Generated artifacts (from `anchor build --arch v3 --tools-version v1.57`):** `target/idl/circuit.json`, `target/types/circuit.ts`, `packages/sdk/src/circuit_sdk/idl/circuit.json`, `packages/matcher/src/generated/circuit.ts`, `packages/matcher/src/generated/circuit_errors.ts`.

**Tests:** `tests/tests/settle_cycle.ts` — new (accountsStrict, actual Anchor/custom/constraint errors asserted). Typecheck/lint/format clean.

**Docs:** `docs/STAGE4_DISCOVERY.md` (approved decisions + feasibility), `docs/TASK_BOARD.md`, this report. **No Stage 5 implemented.**

## Integration tests (`tests/tests/settle_cycle.ts`)
1. Happy path (exact balances): agreed amounts only to counterparties, excess 0, all escrow ATAs closed, rent to corresponding makers, offers `Settled`, `CycleSettled` fields (agreed+excess) verified. **Serialized legacy tx size logged: 903 bytes (< 1232 asserted). CU logged (e.g. 53123–63623 in runs).**
2. Excess balances (Option B): counterparties receive only agreed; excess refunded to makers’ existing offered-mint accounts; `CycleSettled` records excess.
3. **Pending (documented):** insufficient escrow `< offered_amount` not inducible via public API without breaking invariants (escrow PDA-funded only by `create_offer`); Rust `InsufficientEscrowBalance` (`checked_sub`) path exists.
4. Invalid cycle amounts → `InvalidSettlementCycle`.
5. Invalid destination ownership/mint → constraint error (`ConstraintTokenMint`/`TokenMintMismatch`, `ConstraintTokenOwner`/`TokenOwnerMismatch`).
6. Invalid escrow PDA/ATA → `ConstraintSeeds`.
7. Repeat settlement / not Open → fails (closed-account/constraint or `OfferNotOpen`-class semantics).
8. Expired offer → `SettlementExpired` (bounded polling; **harness cannot prove exact `Clock == expires_at`**).
9. Duplicate offer key / aliasing shape → rejected (`ConstraintDuplicateMutableAccount` or handler/constraint errors as applicable).
10. Unsafe aliasing (escrow ATA passed as counterparty dest) → rejected (`ConstraintTokenOwner`/`ConstraintAssociated`/`TokenOwnerMismatch`/`ConstraintDuplicateMutableAccount`).
11a. Cannot settle cancelled offer (Stage 3 interaction) → `OfferNotOpen`/closed-account constraints.
11b. Cannot cancel/refund after settled (Stage 3 interaction) → `OfferNotOpen`/closed-account constraints.
12. Rent recipients = corresponding makers (explicit lamport-delta assertion in happy path).
13. **Pending (documented):** duplicate maker/offered-mint handler isolation limited by valid cycle/create_offer constraints; distinctness enforced by handler checks and mapping/constraints.

## Security review (independent, evidence-based)
- No production logic defects found; no production fixes required. Invariants verified: 3 distinct Offer PDAs/makers/offered mints, A/B/C mapping, dest/excess mint+authority, escrow PDA/canonical ATA validation, `balance >= agreed`, exact agreed + maker-only excess, close rent→maker, atomic status transitions, `Open` + `now < expires_at`, aliasing/duplicate-mutable rejection. IDL (22 accounts, `CycleSettled` fields, errors 6009–6014) consistent with Rust.

## Limitations / notes
- `now == expires_at` boundary not deterministically provable (local-validator polling, no RPC clock warp) — same class as Stage 3; settlement requires `now < expires_at`.
- `InsufficientEscrowBalance` and direct handler-path isolation for duplicate maker/offered-mint are not integration-provable with the current public API/harness without invariant-breaking ledger mutation (documented/pending).
- Original SPL Token only; no bilateral settlement/partial fills/fees/Stage 5+.

## Verification (actual)
| Command | Result |
|---|---|
| `cargo test -p circuit` | **PASS** — 5 passed |
| `anchor build --arch v3 --tools-version v1.57` | **PASS** (exit 0) |
| `NO_DNA=1 anchor test --validator legacy` | **PASS** — **49 passing, 1 pending** (exit 0); includes `settle_cycle` (13 passing, 1 pending), tx size **903 < 1232**, CU logged. Log: `/tmp/anchor_stage4_full_clean.log` |
| `cargo fmt --all -- --check` | **PASS** |
| `cargo clippy -p circuit --all-targets -- -D warnings` | **PASS** |
| `npm run format:check` | **PASS** |
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `cd packages/sdk && uv run pytest -v` | **PASS** — 10 passed |
