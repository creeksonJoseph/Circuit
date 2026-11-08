# CIRCUIT Architecture

CIRCUIT is a permissionless protocol for persistent, full-fill, three-party
token exchanges on Solana. The system separates untrusted off-chain discovery
from authoritative on-chain validation.

## System boundaries

```text
Applications
    |
    | create offers and sign deposits
    v
Anchor program on Solana
    |  Offer PDAs, escrow ATAs, lifecycle, atomic settlement
    ^
    | RPC reads and proposed 22-account instruction
    |
TypeScript matcher
    |
    +-- discovers and decodes offers
    +-- finds directed cycles
    +-- resolves existing token accounts
    +-- performs non-atomic preflight

Python SDK
    |
    +-- derives PDAs
    +-- decodes Offer accounts
    +-- builds unsigned instructions
```

The program is the only authority for state transitions. The matcher and SDK
never receive privileged settlement control and do not sign for users.

## On-chain program

The Rust/Anchor program owns the `Offer` accounts and validates every supplied
account during creation, cancellation, expiry refund, and settlement. Each
offer has:

- an Offer PDA derived from `[b"offer", maker, nonce_le]`;
- an escrow authority PDA derived from `[b"escrow", offer]`;
- an original SPL Token escrow ATA controlled by that authority.

The offer lifecycle is one-way:

```text
Open -> Settled
Open -> Cancelled
Open -> Expired
```

The `settle_cycle` instruction accepts three offers and exactly 22 accounts.
It checks the directed mint and amount relationships, distinct makers, status,
expiry, PDA relationships, token-account ownership, and escrow balances before
executing three signed SPL Token transfers. Solana transaction atomicity makes
the exchange all-or-nothing.

See the [Protocol](docs/PROTOCOL.md) reference for the complete account order.

## Matcher

The matcher uses Solana RPC with `confirmed` commitment by default. It:

1. filters and decodes 148-byte Offer accounts;
2. finds directed three-offer cycles using integer `bigint` values;
3. canonicalizes and conflict-checks candidates;
4. resolves six existing destination/refund token accounts;
5. rechecks live offer and escrow state;
6. builds the exact settlement instruction.

Account resolution prefers canonical ATAs, accepts one unambiguous valid
noncanonical account, and rejects missing or ambiguous roles. Settlement does
not create destination accounts. The final preflight is advisory because
state may change between RPC reads and execution.

See the [TypeScript Matcher](docs/TYPESCRIPT_MATCHER.md) guide.

## SDK

The Python SDK is managed with `uv` and uses `solders` instruction and public
key types. It provides deterministic PDA helpers, Offer decoding, integer
range validation, and unsigned builders for the program instructions.
Applications retain control of signing, RPC submission, and wallet custody.

See the [Python SDK](docs/PYTHON_SDK.md) guide.

## Trust and security

The matcher is an optimization and coordination layer, not a custodian. RPC
responses, candidate metadata, account maps, and transaction callers are
untrusted. The program independently validates all security-sensitive
relationships. Only the original SPL Token Program is supported in the MVP;
partial fills, fees, Token-2022, and privileged settlement authority are out
of scope.

See the [Security](docs/SECURITY.md) guide.

## Network configuration

The deployed program ID is
`4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc` on Solana Devnet. Localnet and
Devnet use the same program ID in `Anchor.toml`, while RPC endpoints and
wallets remain environment-specific.

See [Deployment](docs/DEPLOYMENT.md) and [Troubleshooting](docs/TROUBLESHOOTING.md).

---

[Documentation index](docs/README.md) · [Protocol](docs/PROTOCOL.md) ·
[Security](docs/SECURITY.md)
