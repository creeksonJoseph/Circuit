# Python SDK

The SDK is a lightweight `uv` package for applications that need to construct
CIRCUIT addresses, decode offers, validate integer amounts, and create
`solders` instructions.

## Setup

```bash
cd packages/sdk
uv sync --locked
uv run pytest
```

Build a wheel with `uv build --wheel`. From the repository root, the equivalent
commands are `npm run test:sdk` and `npm run build:sdk`.

## Public API

The package exports:

- `find_offer_address` and `find_escrow_authority_address`;
- `Offer` and `OfferStatus`;
- `to_u64` and `to_i64` integer validators;
- `build_create_offer`, `build_cancel_offer`, `build_refund_expired`, and
  `build_settle_cycle`.

Instruction builders return `solders` instructions. They do not sign, submit,
create wallets, or create destination accounts. The caller supplies public
keys, adds the instruction to a transaction, and signs with the appropriate
wallet.

```python
from circuit_sdk import build_create_offer, find_offer_address

offer, bump = find_offer_address(maker, nonce)
instruction = build_create_offer(
    maker=maker,
    nonce=nonce,
    offered_mint=offered_mint,
    requested_mint=requested_mint,
    offered_amount=10,
    requested_amount=5,
    expires_at=expires_at,
    maker_offered_ata=maker_offered_ata,
    escrow_ata=escrow_ata,
    offer=offer,
)
```

Amounts are integer base units. `Offer.from_bytes` decodes the Anchor account
layout and preserves u64 amounts and i64 timestamps as Python integers.

See [Protocol](PROTOCOL.md) for account relationships and
[Examples](EXAMPLES.md) for settlement preparation.

---

[Documentation index](README.md) · [Getting Started](GETTING_STARTED.md) ·
[TypeScript Matcher](TYPESCRIPT_MATCHER.md)
