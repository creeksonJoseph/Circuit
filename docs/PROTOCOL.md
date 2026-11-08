# CIRCUIT Protocol

CIRCUIT coordinates full-fill, three-party circular exchanges of original SPL
tokens. The program is the source of truth; the matcher only proposes a
settlement.

## Offer model

An `Offer` records:

- maker and unique nonce;
- offered and requested mints;
- offered and requested integer amounts;
- creation and expiry timestamps;
- lifecycle status and PDA bumps.

The offer PDA is derived from `[b"offer", maker, nonce_le]`. Its escrow
authority is derived from `[b"escrow", offer]`, and the escrow ATA holds the
offered tokens under that PDA authority.

## Lifecycle

```text
Open -> Settled
Open -> Cancelled
Open -> Expired
```

Creation deposits the offered amount. The maker may cancel while open. Anyone
may refund an expired offer to its maker. Settlement consumes three open,
unexpired offers and closes their escrow accounts.

## Three-party settlement

For offers A, B, and C:

```text
A offers X and requests Y
B offers Y and requests Z
C offers Z and requests X
```

Settlement transfers:

- A's escrow X to C's X token account;
- B's escrow Y to A's Y token account;
- C's escrow Z to B's Z token account.

The program independently checks offer PDAs, makers, mints, amounts, statuses,
expiry, escrow authorities, token accounts, and balances. It then performs all
three SPL Token transfers in one atomic instruction. Destination and refund
token accounts must already exist; settlement does not create them.

## Account requirements

The settlement instruction consumes 22 accounts:

1. three writable offers;
2. three read-only mints;
3. three escrow authority PDAs;
4. three writable escrow ATAs;
5. three writable counterparty destinations;
6. three writable excess-refund accounts;
7. three writable maker rent recipients;
8. the original SPL Token program.

See [TypeScript Matcher](TYPESCRIPT_MATCHER.md), [Security](SECURITY.md), and
[Examples](EXAMPLES.md).

---

[Documentation index](README.md) · [Security](SECURITY.md)
