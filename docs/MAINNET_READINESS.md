# CIRCUIT Mainnet Readiness

**Current status: not mainnet-ready.** Devnet deployment exists, but mainnet
requires the gates below. This page is the go/no-go checklist for real assets.

## What is already verified

- Rust program builds; local integration suite: **51 passing, 1 pending**.
- Matcher unit tests: **17 passing**.
- Stage 5 matcher-to-settlement integration: **2 passing**.
- Escrow, cancel, refund, and atomic three-party settlement paths are covered
  by real local-validator tests.
- Devnet deployment is documented in [DEPLOYMENT.md](DEPLOYMENT.md).

## Hard blockers (owner action required)

These cannot be completed by repository code changes alone.

### 1. Independent security audit

Commission a Solana/Anchor auditor to review:

- `create_offer`, `cancel_offer`, `refund_expired`, `settle_cycle`;
- escrow PDA and ATA authority/lifecycle;
- destination/refund account constraints;
- pre-created escrow ATA, frozen-account, malicious-mint, and spam/threat models;
- rent/close behavior and upgrade authority.

Resolve all high/medium findings and publish the final report. A self-review is
not an audit.

### 2. Mainnet deployment and key management

- Decide whether to reuse the current program ID or deploy a new mainnet
  program keypair (a new keypair changes the program ID everywhere).
- Fund a mainnet deploy wallet.
- Decide the upgrade authority: single deployer, multisig, or timelock. Prefer a
  multisig/timelock, not a hot wallet.
- Decide whether the program stays upgradeable or is frozen after launch.
- Build reproducibly and deploy with verified bytecode.
- Publish the IDL and verify it on-chain.

### 3. Production infrastructure

- Redundant HTTPS mainnet RPC plus WebSocket endpoint(s), with fallback.
- Indexer or matcher service; users should not scan all program accounts from a
  browser.
- Monitoring and alerting for failed settlements, stale offers, RPC lag, and
  escrow anomalies.
- Transaction landing strategy: priority fees, retries, blockhash refresh.
- Correct `processed` vs `confirmed` handling in every client. Fixture code must
  confirm writes at the same commitment the matcher reads.

### 4. Real-asset risk and operations

- Define launch caps, allowlisted mints, or a guarded beta.
- Name an incident-response owner and write the emergency runbook.
- Fund a bug bounty or staged disclosure program.
- Complete legal/compliance review for your jurisdiction and users.
- Accept or change the product limitations below.

## Product limitations to accept or change

- Exactly three-party cycles only.
- Full fills only; no partial fills.
- Original SPL Token only; no Token-2022.
- Destination and refund token accounts must already exist.
- Offer accounts are never closed, so their rent remains locked.
- No protocol fee or spam/rate-limiting model.
- Permissionless settlement is race-prone by design; the on-chain program
  remains authoritative.

## Repository gates (should stay green)

```bash
npm run test -w @circuit/matcher
npm run typecheck
npm run format:check
npm run lint
cargo fmt --all -- --check
cargo clippy -p circuit --all-targets -- -D warnings
cargo test -p circuit
```

Run the integration suite against a real validator before every release:

```bash
NO_DNA=1 anchor test --validator legacy
```

## Mainnet go/no-go

Do not deploy real assets until every item is checked:

- [ ] Audit complete, findings resolved, report published.
- [ ] Reproducible build verified against deployed bytecode.
- [ ] Program ID and upgrade authority confirmed.
- [ ] Upgrade authority moved to multisig/timelock (or program frozen).
- [ ] IDL published and verified.
- [ ] Redundant RPC/WebSocket and monitoring live.
- [ ] Matcher/indexer deployed with correct commitment handling.
- [ ] Small-value mainnet settlement test passed.
- [ ] Incident-response runbook and owner in place.
- [ ] Bug bounty or disclosure process live.
- [ ] Legal/compliance sign-off complete.
- [ ] Launch caps and real-asset risk accepted.

Until then, keep traffic on Devnet/localnet.
