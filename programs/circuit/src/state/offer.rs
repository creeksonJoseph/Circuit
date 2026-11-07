use anchor_lang::prelude::*;

/// A persistent offer that escrows the maker's offered tokens until settled,
/// cancelled, or expired.
#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub version: u8,
    pub bump: u8,
    pub escrow_bump: u8,
    pub status: OfferStatus,
    pub maker: Pubkey,
    pub nonce: u64,
    pub offered_mint: Pubkey,
    pub requested_mint: Pubkey,
    pub offered_amount: u64,
    pub requested_amount: u64,
    pub created_at: i64,
    pub expires_at: i64,
}

/// Lifecycle status for an offer. Only `Open` is used in Stage 2.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum OfferStatus {
    Open,
    Settled,
    Cancelled,
    Expired,
}
