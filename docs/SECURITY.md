# CIRCUIT — Security Invariants

**Status:** Stage 1 scaffold. The invariants below are requirements for later
stages; they are not yet implemented or tested.

## Invariants

1. The Solana program is the sole authority for protocol state transitions.
2. The matcher is untrusted and never signs or receives privileges.
3. Every settlement is revalidated on-chain, including mints, amounts, PDAs,
   escrow balances, destinations, status, and expiry.
4. A caller can never redirect escrowed assets or a refund recipient.
5. All three settlement legs execute atomically; one failure reverts all.
6. Status transitions are one-way and prevent replay/double settlement.
7. PDAs use canonical bumps and distinct seed prefixes.
8. Escrow token accounts are owned by an escrow authority PDA controlled only
   by the program.
9. Only the original SPL Token program is accepted in the MVP.
10. Amounts are integer base units; no floating-point arithmetic.
11. No private key, seed phrase, or deploy keypair is committed.
12. No backend has privileged settlement control.

## Stage 1 controls

- The program has no offer, escrow, settlement, or matching logic.
- `initialize` creates a single `ProtocolConfig` PDA with `init`; double
  initialization fails.
- The local wallet lives outside the repository.
- `target/`, `.env`, and keypair files are gitignored.
- The frontend receives only public `VITE_*` configuration.

## Planned threat tests

- Wrong offer/escrow/destination PDA or bump.
- Substituted escrow or destination token account.
- Wrong mint, amount, owner, or token program.
- Duplicate offer, maker, mint, escrow, or destination.
- Expired, cancelled, settled, or replayed offer.
- One failing leg reverting all three transfers.
- Unauthorized cancellation or refund redirection.
- Token-2022 mint/account rejection.
- Freeze-authority denial of service.
- Transaction size and compute limits.

## Known limitations to document in later stages

- Freeze authority can make a mint's accounts unsettleable.
- Escrow dust remains after settlement.
- Offer accounts retain rent in terminal states.
- The Devnet deployer retains upgrade authority.
- Permissionless refunds require the maker's offered-token ATA to exist.
