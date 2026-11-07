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
}
