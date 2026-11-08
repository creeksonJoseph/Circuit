# TypeScript Matcher

The matcher package is off-chain, untrusted infrastructure. It reads Solana
RPC state, proposes compatible cycles, resolves existing token accounts, and
builds a transaction instruction. The on-chain program remains authoritative.

## Core flow

```ts
const { discovery, match } = await discoverAndMatch(connection, {
  commitment: "confirmed",
  nowUnixSeconds: BigInt(Math.floor(Date.now() / 1000)),
  expirySafetyBufferSeconds: 30n,
});
```

`discoverOffers` filters Offer accounts by the Anchor discriminator and
decodes 148-byte accounts. `findCycleCandidates` performs directed matching
using `bigint` amounts and expiry timestamps. `resolveCandidateAccounts`
requires existing, valid original-SPL token accounts for all six destination
and refund roles.

Before sending a transaction, re-read the candidate with
`recheckCandidateState`. This validates live offer fields, status, expiry,
escrow mint/authority/balance, and resolved token-account relationships. It is
only a preflight: state can change after the final RPC read.

## Build settlement

```ts
const instruction = buildSettleCycleFromPlan(
  candidate.settlementAccounts,
  candidate.accountResolutions,
);
```

The builder rejects unresolved or mismatched roles and produces the exact
22-account `settle_cycle` instruction. It does not create ATAs or sign.

Destination mapping is fixed:

- A escrow → C-owned X account;
- B escrow → A-owned Y account;
- C escrow → B-owned Z account.

See [Protocol](PROTOCOL.md), [Security](SECURITY.md), and [Examples](EXAMPLES.md).
Use [Troubleshooting](TROUBLESHOOTING.md) for RPC or
account-resolution failures.

---

[Documentation index](README.md) · [Protocol](PROTOCOL.md) ·
[Python SDK](PYTHON_SDK.md)
