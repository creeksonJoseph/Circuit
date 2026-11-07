# CIRCUIT — Technical Plan

**Stage:** 0 — Technical discovery, revised during Stage 1  
**Date:** 2026-11-06 (Stage 0); revised 2026-11-07 (Stage 1)  
**Status:** Stage 0 plan approved; Stage 1 scaffold implemented with two language changes.  
**Related documents:** `ENVIRONMENT_REPORT.md`, `PROPOSED_DEPENDENCIES.md`, `PROPOSED_PROJECT_STRUCTURE.md`, `BUILD_AND_TEST.md`

> **Stage 1 revision (2026-11-07): SDK is Python; frontend is React + JS**
>
> Two Stage 0 decisions changed at the user's request:
>
> 1. The reusable SDK is implemented in **Python** (`packages/sdk`), not
>    TypeScript. Future SDK work must extend the Python package. Do not create
>    a TypeScript SDK.
> 2. The frontend is **React + JavaScript/JSX** (`app`), not TypeScript. Do not
>    convert it to TypeScript.
>
> The matcher and integration tests remain TypeScript. All other Stage 0
> decisions — Anchor 1.2.2, Solana 4.1.2, platform-tools v1.57, SBPF v3,
> web3.js 1.99.0, Mocha 11.7.5, `anchor test --validator legacy` — remain in
> force.
>
> Authoritative commands are in `BUILD_AND_TEST.md`. The Stage 0 design below is
> retained; the stage descriptions that mention a TypeScript SDK or a
> TypeScript frontend are superseded by this note.

---

## 1. Scope and non-goals

### 1.1 MVP scope

- Rust + Anchor Solana program.
- Three-party circular exchanges only.
- Original SPL Token Program only.
- Persistent offer accounts.
- PDA-controlled token escrow.
- Offer creation, cancellation, and expiry refunds.
- Permissionless atomic settlement.
- Off-chain TypeScript cycle matcher.
- Reusable **Python** SDK (Stage 1 change from the original TypeScript proposal).
- **React + JavaScript** demonstration application (Stage 1 change from the
  original TypeScript proposal).
- Local testing first, then Solana Devnet deployment.

### 1.2 Non-goals

- Partial fills.
- Protocol fees.
- Token-2022 or token extensions.
- Order books, AMMs, or price curves.
- More than three parties.
- A privileged settlement authority or backend.
- Mainnet deployment.
- Upgradability policy beyond the Devnet MVP.

---

## 2. Protocol design

### 2.1 Account model

| Account | Seeds | Owner | Contents |
|---|---|---|---|
| `Offer` | `[b"offer", maker, nonce_le]` | CIRCUIT program | Version, bump, escrow bump, status, maker, nonce, offered mint/amount, requested mint/amount, created/expiry timestamps |
| Escrow authority | `[b"escrow", offer_key]` | System program (PDA, no data) | Signs SPL Token CPIs for the escrow |
| Escrow token account | ATA of `(escrow_authority, offered_mint, SPL Token)` | SPL Token program | Holds the maker's deposited tokens |
| Maker destination ATA | ATA of `(maker, requested_mint, SPL Token)` | SPL Token program | Receives the asset the maker requested |

The `Offer` account describes the agreement. The escrow token account holds the assets. The escrow authority is a PDA controlled only by the CIRCUIT program.

### 2.2 Suggested `Offer` layout

```rust
#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub version: u8,
    pub bump: u8,
    pub escrow_bump: u8,
    pub status: OfferStatus,       // 1 byte
    pub maker: Pubkey,             // 32
    pub nonce: u64,                // 8
    pub offered_mint: Pubkey,      // 32
    pub requested_mint: Pubkey,    // 32
    pub offered_amount: u64,       // 8
    pub requested_amount: u64,     // 8
    pub created_at: i64,           // 8
    pub expires_at: i64,           // 8
}
```

Approximate size: 8-byte discriminator + 148 bytes of fields. Rent is small. Add a `version` field so a future migration can be detected. Do not add unused reserved bytes without an explicit migration plan.

`OfferStatus`:

```rust
pub enum OfferStatus {
    Open,
    Settled,
    Cancelled,
    Expired,
}
```

### 2.3 PDA derivation rules

| PDA | Seeds | Bump handling |
|---|---|---|
| Offer | `[OFFER_SEED, maker.as_ref(), &nonce.to_le_bytes()]` | Store canonical bump in `offer.bump` |
| Escrow authority | `[ESCROW_SEED, offer.key().as_ref()]` | Store canonical bump in `offer.escrow_bump` |
| Escrow ATA | `get_associated_token_address_with_program_id(&escrow_authority, &offered_mint, &spl_token::ID)` | No bump; ATA program derives it |

Invariants:

1. Use `find_program_address` to obtain the canonical bump; never accept a bump from instruction data.
2. On every later instruction, re-derive the expected address and compare it to the account key. Also compare the stored bump to the canonical bump.
3. Use distinct domain-separation prefixes: `b"offer"` and `b"escrow"`.
4. Do not use `Pubkey::create_with_seed` or legacy seeded accounts.
5. Use the token program ID in ATA derivation, not a hard-coded assumption that could be confused with Token-2022.
6. Do not trust `offer.maker` from instruction arguments. Read it from the validated `Offer` account.

The recommended validation helper is:

```rust
pub fn validate_offer_pda(offer: &Account<Offer>, program_id: &Pubkey) -> Result<()> {
    let (expected, canonical_bump) = Pubkey::find_program_address(
        &[OFFER_SEED, offer.maker.as_ref(), &offer.nonce.to_le_bytes()],
        program_id,
    );
    require_keys_eq!(offer.key(), expected, CircuitError::InvalidOfferPda);
    require_eq!(offer.bump, canonical_bump, CircuitError::InvalidOfferBump);
    Ok(())
}
```

This avoids relying on self-referential Anchor `seeds` constraints and makes the check explicit in the handler.

### 2.4 Instruction set

#### `create_offer`

Arguments:

```text
nonce: u64
offered_mint: Pubkey
requested_mint: Pubkey
offered_amount: u64
requested_amount: u64
expires_at: i64
```

Accounts (about 10):

```text
maker (signer, mut, payer)
offer (init, PDA, mut)
offered_mint (readonly)
requested_mint (readonly)
maker_offered_ata (mut)
escrow_authority (PDA, readonly, unchecked)
escrow_ata (mut, init_if_needed ATA)
token_program
associated_token_program
system_program
```

Validation:

- `offered_amount > 0`, `requested_amount > 0`.
- `offered_mint != requested_mint`.
- `expires_at > Clock::get()?.unix_timestamp`.
- Both mints are owned by the original SPL Token program.
- `maker_offered_ata.mint == offered_mint` and `maker_offered_ata.owner == maker`.
- `maker_offered_ata.amount >= offered_amount`.
- Offer PDA is canonical and unused (`init` enforces uniqueness).
- Escrow authority PDA is canonical.
- Escrow ATA has the correct mint and authority. `init_if_needed` allows a pre-created ATA to be reused; Anchor's constraints reject a wrong mint/authority.

Effect:

1. Create the offer account.
2. Create/reuse the escrow ATA.
3. `transfer_checked` `offered_amount` from `maker_offered_ata` to `escrow_ata`, signed by `maker`.
4. Set status `Open`.
5. Emit `OfferCreated`.

The deposit is the maker's authorization. No later settlement signature from the maker is required, and the maker cannot redirect the escrow except through `cancel_offer` or expiry refund to themselves.

#### `cancel_offer`

Accounts (about 6):

```text
maker (signer)
offer (mut, has_one = maker)
escrow_authority (PDA)
escrow_ata (mut)
maker_offered_ata (mut)
token_program
```

Validation:

- `offer.status == Open`.
- `maker` is the stored maker.
- Offer/escrow PDAs and escrow ATA are canonical.
- Escrow ATA mint == offered mint; authority == escrow authority.
- `maker_offered_ata` mint == offered mint; owner == maker.
- No expiry check is required: the maker may cancel while the offer is `Open`, including after the deadline; the economic result is the same as an expiry refund.

Effect:

1. Transfer the full escrow balance to `maker_offered_ata`, signed by the escrow authority PDA.
2. Close the escrow ATA to the maker, returning rent.
3. Set status `Cancelled`.
4. Emit `OfferCancelled`.

The offer account is retained.

#### `refund_expired`

Permissionless; no protocol signer is required. The transaction fee payer still signs at the transaction level.

Accounts (about 5):

```text
offer (mut)
escrow_authority (PDA)
escrow_ata (mut)
maker_offered_ata (mut, fixed to offer.maker)
token_program
```

Validation:

- `offer.status == Open`.
- `Clock::get()?.unix_timestamp >= offer.expires_at`.
- Offer/escrow PDAs and escrow ATA are canonical.
- `maker_offered_ata.owner == offer.maker`, mint == offered mint.

Effect:

1. Transfer the full escrow balance to the maker's offered-token ATA.
2. Close the escrow ATA to the maker.
3. Set status `Expired`.
4. Emit `OfferExpired`.

The caller cannot choose the recipient. The recipient is always the original maker.

#### `settle_cycle`

Permissionless. No offer maker signs. The transaction fee payer signs at the transaction level.

Accounts (13 recommended):

```text
offer_a, offer_b, offer_c                       (mut)
escrow_authority_a, escrow_authority_b, escrow_authority_c   (PDA, readonly)
escrow_a, escrow_b, escrow_c                     (mut)
destination_a, destination_b, destination_c      (mut)
token_program
```

`destination_x` is the ATA of `offer_x.maker` for `offer_x.requested_mint`.

Optional alternative: add `mint_a`, `mint_b`, `mint_c` and use `transfer_checked` for payouts. That raises the count to 16 and is still within limits, but the 13-account form is preferred because the escrow token accounts already carry authoritative mint fields and are owned by the SPL Token program.

### 2.5 Settlement algorithm

Let the offers be `[A, B, C]` in the order supplied by the caller/matcher.

**Step 1 — Structural checks**

```text
A.key != B.key != C.key
A.maker != B.maker != C.maker
all three offers are Open
now < A.expires_at, now < B.expires_at, now < C.expires_at
A.offered_mint, B.offered_mint, C.offered_mint are pairwise distinct
```

**Step 2 — Cycle checks**

```text
A.requested_mint   == B.offered_mint
A.requested_amount == B.offered_amount

B.requested_mint   == C.offered_mint
B.requested_amount == C.offered_amount

C.requested_mint   == A.offered_mint
C.requested_amount == A.offered_amount
```

Interpretation: A receives B's offered asset, B receives C's, C receives A's. This matches the approved architecture.

**Step 3 — PDA and escrow checks**

For each offer `X`:

```text
offer_pda(X)       == expected offer PDA
escrow_authority(X) == expected escrow authority PDA
escrow_ata(X)      == expected ATA(escrow_authority(X), X.offered_mint)
escrow_ata(X).mint    == X.offered_mint
escrow_ata(X).owner   == escrow_authority(X)
escrow_ata(X).amount >= X.offered_amount
destination(X)     == expected ATA(X.maker, X.requested_mint)
destination(X).mint   == X.requested_mint
destination(X).owner  == X.maker
```

The destination check is the most important anti-redirection check. A malicious settlement caller cannot substitute an arbitrary recipient account.

**Step 4 — Transfers**

```text
escrow_a -> destination_c : A.offered_amount
escrow_b -> destination_a : B.offered_amount
escrow_c -> destination_b : C.offered_amount
```

Each transfer is a CPI to the original SPL Token program, signed by the corresponding escrow authority PDA using `invoke_signed`.

**Step 5 — State updates**

```text
A.status = Settled
B.status = Settled
C.status = Settled
emit CycleSettled { a, b, c, amounts }
```

If any check or any CPI fails, the whole transaction reverts. No status changes and no transfers persist.

### 2.6 Amounts and arithmetic

- All amounts are `u64` base units.
- The SDK accepts `bigint` and converts to `BN` for Anchor; it never uses JavaScript `number` for token amounts.
- Display formatting is a separate, lossy-only-at-the-edge operation.
- No percentages, fees, or price calculations in the MVP.
- Use checked arithmetic if any arithmetic is introduced; comparisons are sufficient for the base protocol.

---

## 3. Local testing strategy

### 3.1 The critical toolchain detail

Anchor 1.2.2's `anchor test` defaults to **surfpool**:

```text
--validator <VALIDATOR>   [default: surfpool]   [possible values: surfpool, legacy]
```

Surfpool is a separate binary and is **not installed** on this machine. Therefore the default command would fail. The approved local command is:

```bash
NO_DNA=1 anchor test --validator legacy
```

`legacy` uses the `solana-test-validator` that ships with the Solana CLI 4.1.2. This is the closest match to the architecture's "local Solana testing" requirement and avoids adding an early-stage validator dependency.

### 3.2 Testing layers

| Layer | Tool | What it proves | Gate |
|---|---|---|---|
| Rust unit tests | `cargo test` | Pure helpers: PDA derivation, cycle math, amount parsing, error cases | Every stage |
| Optional Rust LiteSVM | `cargo test` with `litesvm 0.15.0` | Fast in-process instruction behaviour | Optional |
| TypeScript integration | `mocha` + `ts-mocha` + `solana-test-validator` | Real program deployment, real SPL Token/ATA CPIs, real transaction size and signers | Required |
| SDK/matcher unit | Vitest | Address derivation, decoding, graph/cycle logic | Stage 5–6 |
| Frontend build | `vite build` | Demo compiles and bundles | Stage 7 |
| Devnet smoke | SDK/scripts | Deployed program works with real wallets and Devnet mints | Stage 8 |

### 3.3 How `anchor test --validator legacy` works

1. `anchor build` compiles the program and generates the IDL/types.
2. Anchor starts `solana-test-validator` on localnet.
3. Anchor deploys the program to the local validator.
4. Anchor runs the `[scripts] test` command.
5. Anchor sets `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET` for that command.
6. The test process runs Mocha/`ts-mocha` against `http://127.0.0.1:8899`.
7. Anchor stops the validator after the suite finishes.

This was verified from the Anchor 1.2.2 CLI source: the test script is executed with `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET` in its environment. The test helper should still default to `http://127.0.0.1:8899` and `~/.config/solana/id.json` if either variable is absent.

### 3.4 Manual local workflow

Useful when debugging a single test or inspecting the validator:

```bash
# Terminal 1: validator
solana-test-validator --reset

# Terminal 2: build and deploy
anchor build --arch v3 --tools-version v1.57
anchor deploy --provider.cluster localnet

# Terminal 3: integration tests
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 \
ANCHOR_WALLET=$HOME/.config/solana/id.json \
npm run test:integration -w @circuit/tests
```

### 3.5 Test fixtures

The integration harness should create, per run:

- Three funded wallets: Alice, Bob, Charlie.
- Three SPL mints with 6 decimals: WOOD, STONE, FOOD.
- Mint authority controlled by the test harness.
- Freeze authority disabled for demo/test mints so transfers cannot be frozen mid-test.
- Maker ATAs for offered and requested mints.
- Token balances sufficient for the requested offers.
- A funded fee payer for permissionless settlement and refund calls.

All fixtures are ephemeral. Only public keys/amounts may be written to `tests/fixtures/demo-mints.json`; no keypair material.

### 3.6 Required test cases

**Offer creation**

- Happy path: offer created, escrow ATA funded, status `Open`.
- Zero offered amount fails.
- Zero requested amount fails.
- Same offered/requested mint fails.
- Expiry in the past fails.
- Wrong maker ATA owner fails.
- Wrong maker ATA mint fails.
- Insufficient maker balance fails.
- Token-2022 mint/account is rejected.
- Duplicate offer PDA/nonce fails.
- Pre-created correct escrow ATA is reused safely.

**Cancellation**

- Maker cancels an open offer; exact balance returns; escrow ATA closes; status `Cancelled`.
- Non-maker cannot cancel.
- Cancel after settlement fails.
- Double cancel fails.
- Cancel with a wrong escrow ATA fails.

**Expiry refund**

- Anyone can refund after expiry; exact balance returns to the original maker; status `Expired`.
- Refund before expiry fails.
- Double refund fails.
- Caller cannot redirect the refund to another wallet.
- Refund after cancellation/settlement fails.

**Settlement**

- Happy path: all three balances change correctly; all statuses become `Settled`.
- Wrong cycle order fails.
- Mint mismatch fails.
- Amount mismatch fails.
- Expired offer fails.
- Non-open offer fails.
- Duplicate maker fails.
- Duplicate offer account fails.
- Substituted escrow ATA fails.
- Substituted destination ATA/recipient fails.
- Wrong escrow authority/bump fails.
- Insufficient escrow balance fails.
- Token-2022 account fails.
- Replay/double settlement fails.
- One failing leg reverts all three transfers and all status changes (atomicity).

**Transaction limits**

- Log serialized message size for `settle_cycle`; assert < 1232 bytes for a legacy transaction.
- Log compute units consumed; assert below the configured limit with margin.
- Confirm no lookup table is required for the MVP.

### 3.7 Test commands

```bash
# Program build
anchor build --arch v3 --tools-version v1.57

# Rust unit tests
cargo test --workspace

# Optional LiteSVM tests
cargo test -p circuit

# Full integration suite on the legacy local validator
NO_DNA=1 anchor test --validator legacy

# SDK/matcher unit tests
npm run test -w @circuit/sdk
npm run test -w @circuit/matcher

# Frontend production build
npm run build -w @circuit/app

# Static checks
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run typecheck
npm run lint
```

---

## 4. Technical risks and mitigations

### 4.1 Transaction account limits

**Risk:** A settlement transaction could exceed Solana's account or size limits.

**Assessment for the MVP:**

- `settle_cycle` uses 13 accounts: 3 offers, 3 escrow authority PDAs, 3 escrow ATAs, 3 destination ATAs, 1 token program.
- A legacy transaction with one fee-payer signature and 13 account keys is roughly 600–700 bytes before padding, below the 1232-byte legacy limit.
- Solana allows up to 64 accounts per transaction; 13 is well below that.
- Three SPL Token transfers consume far less than the per-transaction compute limit; the exact number will be measured in Stage 4.
- No address lookup table is required for the MVP.

**Mitigations:**

- Do not add mint accounts to settlement unless `transfer_checked` is specifically required.
- Do not create destination ATAs during settlement. The SDK prepares them before settlement.
- Measure serialized message size and compute units in the settlement test.
- If a future change pushes the transaction over the limit, use a versioned transaction with an address lookup table; do not silently drop validation.

### 4.2 PDA derivation

**Risk:** A malicious caller supplies an account that looks like an offer/escrow but is not the canonical PDA.

**Mitigations:**

- Store canonical bumps and re-derive every PDA in the handler.
- Compare the stored bump to the canonical bump.
- Use distinct seed prefixes.
- Include the maker and nonce in the offer seed; include the offer key in the escrow authority seed.
- Derive the escrow ATA with the SPL Token program ID.
- Reject duplicate offer keys, escrow keys, destinations, and makers.
- Test wrong seeds, wrong bumps, and non-canonical PDAs.

**Why not rely only on Anchor `seeds` constraints?** Constraints are useful, but self-referential seeds can be subtle. Explicit helper checks in the handler are easier to audit and test. Use both where practical.

### 4.3 Token escrow

**Risk:** Escrowed assets could be moved by an unauthorized party, or the escrow could be unusable.

**Mitigations:**

- Escrow authority is a PDA; only the CIRCUIT program can sign for it.
- The escrow ATA's authority must equal the escrow authority PDA.
- The escrow ATA's mint must equal the offer's offered mint.
- The escrow balance must be at least the offered amount before transfer.
- Deposits use `transfer_checked` with the offered mint's decimals.
- Payouts use `invoke_signed` with the exact escrow seeds.
- The maker never receives a delegate or approval over the escrow.
- Cancellation/refund transfers the full balance and closes the ATA to the maker.
- Settlement transfers the exact offered amount; any unsolicited dust remains in the escrow account. Document this as a known limitation. Do not make settlement depend on an exact balance, because an attacker could grief the offer with a 1-base-unit transfer.

**Token freeze risk:** A mint's freeze authority can freeze an escrow or destination token account, causing settlement/refund to fail. This is a denial-of-service, not a loss of funds. Demo mints must have no freeze authority. Document that arbitrary third-party mints may be unsettleable if frozen.

**Token-2022 risk:** Token-2022 accounts and mints must be rejected. Use `Program<'info, Token>` and `Account<'info, TokenAccount>` from `anchor_spl::token`, and verify mint ownership. Do not enable Token-2022 features.

### 4.4 CPI authorization

**Risk:** The program could sign for a PDA with the wrong seeds, or an arbitrary caller could cause a transfer.

**Mitigations:**

- Use `invoke_signed` only with the exact escrow authority seeds and stored bump.
- Never accept signer seeds from instruction data.
- Validate the token program account and the ATA program account.
- Use `transfer_checked` for maker deposits and `transfer` for PDA-signed payouts.
- Never use `approve`, `set_authority`, or `close_account` on accounts the program does not control.
- Test a forged escrow authority and a forged token program account.

### 4.5 Duplicate accounts and duplicate participants

**Risk:** The same maker, offer, escrow, or destination appears more than once, allowing a degenerate or exploitable "cycle."

**Mitigations:**

- Pairwise distinct offer keys, makers, escrow accounts, destinations, and offered mints.
- Anchor 1.0+ also rejects duplicate mutable accounts in generated account validation; do not rely on that alone.
- Reject the cycle before any CPI.
- Test duplicate maker, duplicate offer, duplicate escrow, and duplicate destination cases.

### 4.6 Replay, double settlement, and expiry races

**Risk:** An offer is settled twice, or an expired offer is settled, or a refund races a settlement.

**Mitigations:**

- Status transitions are one-way: `Open -> Settled`, `Open -> Cancelled`, `Open -> Expired`.
- Every terminal instruction requires `status == Open`.
- Settlement requires `now < expires_at`; refund requires `now >= expires_at`. The two windows do not overlap.
- All three statuses update in the same instruction as the transfers. Atomicity prevents partial state.
- A settlement/refund race is resolved by the first transaction to land; the second fails the status check.
- Tests cover boundary timestamps and double execution.

### 4.7 Matcher trust

**Risk:** The matcher is off-chain and untrusted; it could propose a malicious or stale cycle.

**Mitigations:**

- The program does not accept mint/amount/maker data from the matcher. It reads everything from validated offer accounts.
- The program independently checks the cycle, expiry, status, PDAs, escrow balances, and destinations.
- The matcher only supplies account ordering. A wrong order fails the cycle checks.
- Settlement remains permissionless; anyone can submit a valid cycle without the matcher.
- The matcher must refresh offers before building a transaction; stale cycles fail safely.
- The SDK re-derives every offer PDA, escrow authority, escrow ATA, and destination ATA from validated offer data. Matcher-supplied addresses are hints/cross-checks, never authority.

### 4.8 Account substitution and redirection

**Risk:** A caller substitutes a different token account for a maker's destination and steals the payout.

**Mitigations:**

- Derive the expected destination ATA from `offer.maker` and `offer.requested_mint`.
- Require the supplied destination key to equal the derived ATA.
- Unpack the destination token account and check mint and owner.
- Never accept a recipient address from instruction data.
- Test substitution with a valid token account owned by the attacker.

### 4.9 Rent and account closure

**Risk:** Rent is locked, or an account is closed while still needed.

**Mitigations:**

- Cancel/refund transfer the full escrow balance and close the escrow ATA to the maker.
- Offer accounts are retained in terminal states for auditability; their rent remains locked in the MVP.
- Settlement leaves the escrow ATA open. If the balance is exactly zero, it could be closed later, but the MVP does not require it. Document the small rent lock.
- Cancel/refund and settlement require the relevant maker ATAs to exist. The SDK prepares them. If a maker closes their offered-token ATA, a permissionless refund can fail until it is recreated; this is a liveness limitation, not a loss of funds. Document it.
- Do not close an offer account in the MVP.

### 4.10 Upgrade authority and program trust

**Risk:** Anchor deploys upgradeable programs. The upgrade authority can change program logic.

**Mitigations:**

- The MVP is Devnet-only. Document that the deployer retains upgrade authority.
- There is no instruction-level admin or privileged settlement authority.
- Do not claim the program is immutable.
- A post-MVP decision can burn or multisig the upgrade authority after review.

### 4.11 Toolchain and test-environment risks

| Risk | Mitigation |
|---|---|
| `anchor test` defaults to surfpool, which is not installed | Use `anchor test --validator legacy` |
| Solana `stable` is newer than Anchor 1.2.2's recommended 4.1.2 | Install `/v4.1.2/install` explicitly |
| Node 26 is newer than Anchor's documented example | All engines accept it; fallback Node 24.22.2 |
| TypeScript 7 is too new for `typescript-eslint` | Pin TypeScript 5.9.3 |
| Mocha 12 is outside `ts-mocha` peer range | Pin Mocha 11.7.5 |
| Chai 5+ is ESM-only | Pin Chai 4.5.0 |
| Low RAM on the host | Close memory-heavy apps; existing swap; build once |
| Devnet airdrop rate limits | Use the web faucet or repeated small airdrops; budget SOL |

### 4.12 Frontend-specific risks

- **Node polyfills:** web3.js v1 expects `Buffer`/`process` in the browser. Use `vite-plugin-node-polyfills@0.28.0` and verify the production build.
- **Duplicate web3.js copies:** use the root npm `overrides` to force `@solana/web3.js@1.99.0`. Duplicate copies cause `PublicKey`/`Transaction` type mismatches.
- **Wallet adapter compatibility:** pin `@solana/wallet-adapter-react@0.15.40`, `react-ui@0.9.40`, and `wallets@0.19.40`; all peer on web3.js `^1.99.0`.
- **No secrets in the browser:** the app never reads a private key. Signing goes through the wallet adapter.
- **RPC reliability:** Devnet RPC can rate-limit `getProgramAccounts`. The matcher should handle retries and surface a clear error.

### 4.13 Risk summary

| Risk | Severity | Likelihood | Primary mitigation |
|---|---|---|---|
| Unauthorized escrow movement | Critical | Low | PDA `invoke_signed`, exact seeds, token account checks |
| Destination substitution / theft | Critical | Medium | Derive destination ATA and validate owner/mint |
| Double settlement / replay | High | Medium | One-way status, atomic updates, status checks |
| Expired offer settled | High | Medium | Clock boundary checks; non-overlapping refund window |
| Duplicate participants | High | Medium | Pairwise distinct keys/makers/mints |
| PDA substitution | High | Medium | Re-derive canonical PDAs and bumps |
| Token-2022 accepted | High | Low | Original SPL Token program constraints only |
| Freeze-authority DoS | Medium | Medium | Demo mints without freeze authority; document |
| Transaction size/compute | Medium | Low | 13-account settlement; measure in tests |
| Matcher malicious/stale | Medium | High | On-chain revalidation; permissionless settlement |
| Toolchain mismatch | Medium | High | Exact pins; `--validator legacy`; lockfiles |
| Frontend Buffer/polyfill failure | Medium | Medium | `vite-plugin-node-polyfills`; production build gate |
| Rent locked after settlement | Low | High | Document; optional future close instruction |
| Upgrade authority | Medium | Certain | Devnet-only; document; no admin settlement |

---

## 5. Stage-by-stage implementation plan

### Stage 0 — Discovery and technical planning (this stage)

**Objective:** Confirm the environment, versions, structure, and testing strategy before writing code.

**Deliverables:**

- `ENVIRONMENT_REPORT.md`
- `TECHNICAL_PLAN.md`
- `PROPOSED_DEPENDENCIES.md`
- `PROPOSED_PROJECT_STRUCTURE.md`

**Exit criteria:** Reports reviewed and dependency/structure decisions approved. No application code.

---

### Stage 1 — Project scaffold

**Objective:** Build the foundation without business logic.

**Work:**

1. Install the approved toolchain from `ENVIRONMENT_REPORT.md` §8.
2. Initialise Git.
3. Scaffold the Anchor workspace without overwriting existing root docs (use a temporary directory and merge, or create files manually).
4. Create `programs/circuit` with the module layout in `PROPOSED_PROJECT_STRUCTURE.md`.
5. Create the npm workspace, SDK/matcher/app/test package scaffolds, shared TypeScript config, formatting/linting.
6. Create `Anchor.toml`, `.env.example`, `.gitignore`, `README.md`, `docs/BUILD_AND_TEST.md`.
7. Keep only a trivial build/test instruction; no offer, escrow, settlement, or matching logic.
8. Configure localnet and Devnet program ID placeholders.

**Commands:**

```bash
anchor build --arch v3 --tools-version v1.57
NO_DNA=1 anchor test --validator legacy
npm install
npm run typecheck
npm run build
```

**Acceptance gate:**

- `anchor build` succeeds.
- `anchor test --validator legacy` succeeds with the initial test.
- SDK, matcher, and frontend compile/build.
- No secrets committed.
- No business logic implemented.

---

### Stage 2 — Offer accounts and escrow

**Objective:** Implement offer creation and safe token deposits.

**Work:**

1. Define `Offer`, `OfferStatus`, constants, errors, and events.
2. Implement `create_offer`.
3. Implement canonical PDA helpers and escrow ATA validation.
4. Add `init_if_needed` escrow ATA handling.
5. Add Rust unit tests for pure helpers.
6. Add integration tests for success and failure cases.
7. Add SDK instruction builder and PDA helpers needed by the tests.

**Acceptance gate:**

- Offer PDA and escrow ATA are derived exactly as specified.
- Deposit transfers the exact offered amount.
- Invalid mints, zero amounts, past expiry, wrong ATAs, insufficient balance, duplicate nonce, and Token-2022 are rejected.
- Escrow balance and offer state are verified on-chain.
- No cancellation or settlement yet.

**Commands:**

```bash
anchor build --arch v3 --tools-version v1.57
NO_DNA=1 anchor test --validator legacy
cargo clippy --all-targets -- -D warnings
```

---

### Stage 3 — Offer lifecycle

**Objective:** Implement cancellation, expiry, and refunds.

**Work:**

1. Implement `cancel_offer`.
2. Implement `refund_expired`.
3. Close the escrow ATA and return rent to the maker.
4. Enforce maker-only cancellation and permissionless expiry refund.
5. Add tests for wrong signer, wrong status, double execution, pre-expiry refund, and recipient substitution.
6. Extend the SDK with cancel/refund builders.

**Acceptance gate:**

- Cancel returns the exact escrow balance and closes the escrow ATA.
- Expiry refund is permissionless and always pays the original maker.
- Double cancel/refund fails.
- Settlement/cancel/refund status transitions are one-way.
- No settlement yet.

---

### Stage 4 — Atomic settlement

**Objective:** Implement and verify three-party cycle settlement.

**Work:**

1. Implement `settle_cycle` with the cycle, PDA, escrow, and destination checks in §2.5.
2. Implement the three `invoke_signed` SPL Token transfers.
3. Set all three statuses to `Settled` and emit `CycleSettled`.
4. Add success, wrong-cycle, wrong-mint, wrong-amount, expiry, duplicate-participant, substitution, and replay tests.
5. Add an atomicity test: one failing leg reverts all transfers and statuses.
6. Log serialized transaction size and compute units.
7. Extend the SDK with the settlement builder.

**Acceptance gate:**

- Three-party settlement succeeds and balances are correct.
- All invalid-cycle and substitution cases fail.
- Double settlement fails.
- A failing leg reverts all three legs (atomicity).
- Transaction size < 1232 bytes and compute is comfortably within limits.
- No matcher yet; cycles are constructed manually in tests.

---

### Stage 5 — Matching engine

**Objective:** Discover valid three-party cycles from on-chain offers.

**Work:**

1. Implement `getProgramAccounts` indexing with discriminator/status filters.
2. Build the `(mint, amount)` index.
3. Implement directed three-cycle search.
4. Enforce expiry, open status, duplicate-maker, and distinct-mint filters.
5. Canonicalise rotations and deduplicate results.
6. Produce a settlement account plan for each cycle.
7. Add Vitest unit tests with synthetic offer graphs.
8. Add an integration test that discovers a cycle from real local-chain offers.

**Acceptance gate:**

- Matcher finds the expected three-cycle from fixtures.
- It ignores expired, closed, non-matching, and duplicate-maker offers.
- It does not return the same cycle three times.
- It never signs or assumes privileged access.
- Settlement of a matcher-produced plan succeeds on the local validator.

---

### Stage 6 — Developer SDK

**Objective:** Provide a reusable TypeScript integration interface.

**Work:**

1. Stabilise the public SDK API (§8 of `PROPOSED_PROJECT_STRUCTURE.md`).
2. Implement PDA helpers, fetchers, instruction builders, amount conversion, and error mapping.
3. Add JSDoc/API documentation and usage examples.
4. Add SDK unit tests and a local-validator integration test that uses only the SDK.
5. Ensure the SDK has no React dependency and no private-key handling.
6. Verify IDL/type generation flow.

**Acceptance gate:**

- SDK builds and type-checks.
- A consumer can create, cancel, refund, and settle using only the SDK.
- Amounts are `bigint`/BN end-to-end; no floating point.
- Error messages map to Anchor error codes.
- No app-specific code leaks into the SDK.

---

### Stage 7 — React demonstration application

**Objective:** Demonstrate the full workflow with real wallets.

**Work:**

1. Create the Vite/React app with wallet adapter.
2. Implement offers list, create-offer form, cycle explorer, and settle action.
3. Integrate the SDK and matcher.
4. Add Node polyfills for web3.js v1.
5. Add demo mint/offer setup scripts for localnet and Devnet.
6. Handle transaction pending/success/error states.
7. Verify the production build.

**Acceptance gate:**

- App connects to a wallet on localnet.
- A user can create an offer and see it in the list.
- The matcher displays a valid three-cycle.
- A settlement transaction succeeds and balances update.
- `npm run build -w @circuit/app` succeeds.
- No private key is present in the app or repository.

---

### Stage 8 — Devnet deployment and verification

**Objective:** Deploy and exercise the protocol on Solana Devnet.

**Work:**

1. Generate/confirm a Devnet deploy keypair outside version control.
2. Fund the wallet via airdrop/faucet.
3. Set `Anchor.toml` Devnet program ID.
4. Build and deploy.
5. Create demo mints and distribute tokens.
6. Create three offers and settle a cycle using the SDK/scripts.
7. Verify program deployment, accounts, balances, and events.
8. Document the Devnet runbook.

**Commands (illustrative):**

```bash
solana config set --url devnet
solana airdrop 2
anchor build --arch v3 --tools-version v1.57
anchor deploy --provider.cluster devnet
solana program show <CIRCUIT_PROGRAM_ID> --url devnet
```

**Acceptance gate:**

- Program is deployed and `solana program show` succeeds.
- A full offer -> match -> settle flow succeeds on Devnet.
- No mainnet deployment.
- Deployment wallet/keypair is not committed.

---

### Stage 9 — Final security and integration review

**Objective:** Verify adversarial behaviour and prepare documentation.

**Work:**

1. Run the full security test matrix.
2. Review every account constraint and CPI.
3. Run `cargo fmt`, `cargo clippy`, `npm run typecheck`, `npm run lint`.
4. Verify no secrets, no mainnet configuration, no privileged settlement path.
5. Review known limitations (freeze authority, dust, rent, upgrade authority).
6. Update `README.md`, `docs/SECURITY.md`, `docs/BUILD_AND_TEST.md`, `docs/DEVNET.md`, and `docs/PROGRESS.md`.
7. Produce the final completion report per `AGENTS.MD`.

**Acceptance gate:**

- All security tests pass.
- All builds and static checks pass.
- The demo works on Devnet.
- Known limitations are documented.
- No mainnet deployment.

---

## 6. Security test matrix

| Invariant | Test |
|---|---|
| Only the maker can create an offer for their wallet | Signer/authority mismatch test |
| Offer PDA is canonical | Wrong seeds/bump/nonce test |
| Escrow authority is canonical | Substituted escrow authority test |
| Escrow ATA belongs to the offer | Wrong mint/authority test |
| Deposit amount is exact | balance assertions before/after |
| Offer status is one-way | double cancel/refund/settle tests |
| Expiry boundary is correct | just-before/at/just-after expiry tests |
| Only open offers settle | cancelled/expired/settled offer tests |
| Cycle mints and amounts match exactly | mismatch tests for each leg |
| Participants are distinct | duplicate maker/offer/mint tests |
| Recipients are the original makers | destination substitution tests |
| All legs are atomic | one-failing-leg revert test |
| No unauthorized escrow movement | forged signer/seeds/token program tests |
| No Token-2022 acceptance | Token-2022 mint/account test |
| No replay/double settlement | repeat settlement test |
| No arbitrary caller redirect | attacker-controlled destination test |
| Transaction stays within limits | serialized size + compute-unit assertions |

---

## 7. Devnet deployment plan

1. Approve the use of Devnet and the deployment wallet.
2. Generate or select a Devnet-only keypair; store it outside the repository.
3. Set `solana config set --url devnet`.
4. Fund the wallet using `solana airdrop` and/or the Solana web faucet. Devnet airdrops are rate-limited; budget enough SOL for program deployment and account rent.
5. Confirm `anchor --version` is `1.2.2`, `solana --version` is `4.1.2`, and `anchor build` succeeds locally.
6. Deploy with `anchor deploy --provider.cluster devnet`.
7. Verify with `solana program show <PROGRAM_ID> --url devnet`.
8. Create demo mints with no freeze authority; distribute tokens to demo wallets.
9. Create three offers through the SDK or UI.
10. Run the matcher; settle a cycle through the UI/script.
11. Record transaction signatures and account addresses in `docs/DEVNET.md`.
12. Do not deploy to mainnet.

---

## 8. Open decisions requiring approval

| # | Decision | Recommendation | Alternative |
|---|---|---|---|
| 1 | Package manager | **npm workspaces** | Install pnpm 12.18.0 |
| 2 | Escrow ATA creation | **`init_if_needed`** | Require the maker to pre-create it |
| 3 | Destination ATAs at settlement | **Require them to exist; SDK prepares them** | Create them during settlement with caller-paid rent |
| 4 | Settlement payout instruction | **`transfer` with 13 accounts** | `transfer_checked` with 16 accounts |
| 5 | Escrow dust after settlement | **Leave it; do not require exact balance** | Sweep or close (extra CPIs/accounts) |
| 6 | Expiry boundary | **Settle with `now < expires_at`; refund with `now >= expires_at`** | Inclusive settlement at the boundary |
| 7 | Rust LiteSVM tests | **Optional, using `litesvm 0.15.0`** | TypeScript integration tests only |
| 8 | Node version | **Keep 26.13.0** | Fall back to Node 24.22.2 |
| 9 | Frontend stack | **Vite 7.3.7 + React 19.3.1** | Vite 8.3.6 after a plugin smoke test |
| 10 | TypeScript version | **5.9.3** | TypeScript 7.0.2 after tooling support |
| 11 | Upgrade authority | **Retain for Devnet MVP; document** | Burn/multisig after review |
| 12 | Demo mint freeze authority | **Disabled** | Controlled freeze authority (not recommended for demos) |

---

## 9. Acceptance criteria evidence

| Stage 0 criterion | Evidence |
|---|---|
| All installed versions documented | `ENVIRONMENT_REPORT.md` §2, with exact commands/output |
| Missing dependencies identified | `ENVIRONMENT_REPORT.md` §2.2 and §3 |
| Compatible stable Anchor and TypeScript client versions identified | `PROPOSED_DEPENDENCIES.md` §1–§5, with registry/crate metadata evidence |
| Folder structure agreed | `PROPOSED_PROJECT_STRUCTURE.md` §2–§5 |
| Local testing strategy agreed | This document §3; includes `anchor test --validator legacy` |
| No application features implemented | Only four Markdown reports were written; no program, SDK, matcher, app, or test code |

---

## 10. Stop point

This is the end of Stage 0. No installation, scaffolding, or application implementation has been performed. The next action is review and approval of:

1. `ENVIRONMENT_REPORT.md`
2. `PROPOSED_DEPENDENCIES.md`
3. `PROPOSED_PROJECT_STRUCTURE.md`
4. This plan.

Do not begin Stage 1 until explicitly instructed.
