# CIRCUIT Security Model

## Trust boundaries

- The Anchor program is authoritative for state transitions.
- The matcher is untrusted, non-signing infrastructure.
- RPC data and matcher output are inputs, not authorization.
- Users authorize deposits; no backend receives settlement authority.

## On-chain protections

The program validates supplied offers, PDA relationships, maker identities,
mint relationships, original SPL Token ownership, escrow authority, balances,
status, expiry, destination ownership, and refund recipients. It rejects
duplicate participants and replayed or non-open offers. The three token
transfers execute atomically, so a failed leg reverts the entire settlement.

## Off-chain responsibilities

The matcher decodes accounts using integer-safe `bigint` values, finds directed
cycles, resolves existing token accounts, and performs a live preflight before
building the 22-account instruction. The preflight reduces avoidable failures
but cannot make freshness atomic; only the program can close the race between a
read and transaction execution.

## MVP boundaries

- Original SPL Token Program only; Token-2022 is not accepted.
- Full fills only; no partial fills or fees.
- Integer base units only; no floating-point amounts.
- Permissionless settlement and refunds.
- The Devnet upgrade authority remains controlled by the deployer.
- Destination and maker refund token accounts must exist before settlement or
  refund.

Report suspicious behavior through the repository owner before submitting
transactions with real assets.

---

[Documentation index](README.md) · [Protocol](PROTOCOL.md) ·
[TypeScript Matcher](TYPESCRIPT_MATCHER.md)
