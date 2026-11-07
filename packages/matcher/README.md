# @circuit/matcher

Off-chain three-party cycle matcher for CIRCUIT.

**Stage 1 status:** scaffold only. `findCycles` throws
`CIRCUIT matcher is not implemented in Stage 1.` No matching logic exists yet.

## Commands

```bash
# From the repository root
npm run build -w @circuit/matcher
npm run typecheck -w @circuit/matcher
npm run test -w @circuit/matcher
```

## Boundaries

- The matcher is untrusted. It only proposes account orderings.
- It never signs transactions and has no privileged access.
- The program validates every offer, mint, amount, PDA, escrow, and
  destination before settlement.
- Amounts are `bigint` base units, never JavaScript `number`.

The generated Anchor TypeScript types are copied to `src/generated/` by
`anchor build` and are not edited by hand.
