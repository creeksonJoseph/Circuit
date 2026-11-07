//! CIRCUIT program entrypoint.
//!
//! Stage 1 contains only the scaffold and a trivial configuration
//! initialisation instruction. Offer creation, escrow, settlement, and
//! matching logic are intentionally not implemented yet.

pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use events::*;
pub use instructions::*;
pub use state::*;

declare_id!("4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc");

#[program]
pub mod circuit {
    use super::*;

    /// Initialises the single protocol configuration PDA.
    ///
    /// This is a build/test gate for Stage 1. It does not implement offers,
    /// escrow, settlement, or matching.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handle_initialize(ctx)
    }
}
