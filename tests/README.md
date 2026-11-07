# @circuit/tests

Integration tests for the CIRCUIT Anchor program.

**Stage 1 status:** the suite only verifies the scaffold `initialize`
instruction. Offer, escrow, settlement, and matching tests belong to later
stages.

## Prerequisites

The Anchor program must be built first so that `target/types/circuit.ts` and
`target/idl/circuit.json` exist:

```bash
anchor build --arch v3 --tools-version v1.57
```

The suite constructs its `Program` client directly from
`target/idl/circuit.json` (not `anchor.workspace`), so it runs correctly from
either the repository root or the `tests/` workspace directory.

## Run

The normal entry point starts a local validator, deploys the program, and runs
the suite:

```bash
NO_DNA=1 anchor test --validator legacy
```

`--validator legacy` is required because Anchor 1.2.2 defaults to surfpool,
which is not part of this project's toolchain. `legacy` uses the
`solana-test-validator` bundled with Solana CLI 4.1.2.

To run against an already-running validator:

```bash
ANCHOR_PROVIDER_URL=http://127.0.0.1:8899 \
ANCHOR_WALLET=$HOME/.config/solana/id.json \
npm run test:integration
```

## Rules

- Tests exercise the real program, not a mock of protocol rules.
- Every successful path is paired with an expected-failure case.
- Tests must not suppress errors to make a run pass.
- No test may depend on committed keypair material.
