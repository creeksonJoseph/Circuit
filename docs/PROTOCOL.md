# CIRCUIT — Protocol Notes

**Status:** planned design. Stage 1 implements only a `ProtocolConfig` PDA and
an `initialize` instruction. Nothing below is implemented on-chain yet.

## MVP scope

- Three-party circular exchanges.
- Original SPL Token Program only.
- Standing, full-fill offers.
- Program-controlled escrow.
- Off-chain matching.
- Permissionless atomic settlement.
- No partial fills, fees, Token-2022, or admin settlement authority.

## Planned accounts

| Account | Seeds | Owner | Purpose |
|---|---|---|---|
| `ProtocolConfig` | `[b"config"]` | CIRCUIT program | Layout version and bump (Stage 1) |
| `Offer` | `[b"offer", maker, nonce_le]` | CIRCUIT program | Offer terms and status |
| Escrow authority | `[b"escrow", offer_key]` | System program | PDA authority for escrow tokens |
| Escrow token account | ATA of `(escrow_authority, offered_mint, SPL Token)` | SPL Token program | Holds deposited offered tokens |

## Planned instructions

| Instruction | Signer | Purpose |
|---|---|---|
| `create_offer` | Maker | Create the offer PDA, create/reuse escrow ATA, deposit offered tokens |
| `cancel_offer` | Maker | Refund escrow and mark `Cancelled` |
| `refund_expired` | Anyone | Refund the original maker after expiry and mark `Expired` |
| `settle_cycle` | Anyone | Validate three offers and execute three atomic transfers |

## Planned state machine

```text
Open -> Settled
Open -> Cancelled
Open -> Expired
```

All transitions are one-way. Settlement requires `now < expires_at`; expiry
refund requires `now >= expires_at`.

## Planned settlement order

For offers `[A, B, C]`:

```text
A receives B's offered asset
B receives C's offered asset
C receives A's offered asset
```

The matcher proposes the order. The program independently validates every mint,
amount, PDA, escrow balance, destination, status, and expiry before executing
the three `invoke_signed` SPL Token transfers.

## Current Stage 1 account

```rust
#[account]
pub struct ProtocolConfig {
    pub version: u8,
    pub bump: u8,
}
```

The `initialize` instruction creates this PDA once. A second call fails because
the account already exists.
