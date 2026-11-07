//! CIRCUIT program entrypoint.

pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod pda;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use events::*;
pub use instructions::*;
pub use pda::*;
pub use state::*;

declare_id!("4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc");

#[program]
pub mod circuit {
    use super::*;

    /// Initialises the single protocol configuration PDA.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handle_initialize(ctx)
    }

    /// Creates an offer and escrows the maker's offered tokens.
    pub fn create_offer(
        ctx: Context<CreateOffer>,
        nonce: u64,
        offered_amount: u64,
        requested_amount: u64,
        expires_at: i64,
    ) -> Result<()> {
        instructions::create_offer::handle_create_offer(
            ctx,
            nonce,
            offered_amount,
            requested_amount,
            expires_at,
        )
    }

    /// Cancels an open offer (maker only). Allowed after expiry if still open.
    /// Refunds entire escrow balance to an existing maker-owned offered-mint token account,
    /// closes the escrow ATA, sends rent to the maker, sets status Cancelled.
    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        instructions::cancel_offer::handle_cancel_offer(ctx)
    }

    /// Permissionlessly refunds an expired open offer to the maker.
    /// Caller pays fees only; recipient is always the maker.
    pub fn refund_expired(ctx: Context<RefundExpired>) -> Result<()> {
        instructions::refund_expired::handle_refund_expired(ctx)
    }

    /// Permissionlessly atomically settles a three-offer cycle (A offers X for Y,
    /// B offers Y for Z, C offers Z for X). No maker or taker signatures required.
    pub fn settle_cycle(ctx: Context<SettleCycle>) -> Result<()> {
        instructions::settle_cycle::handle_settle_cycle(ctx)
    }
}
