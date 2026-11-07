use anchor_lang::prelude::*;

/// Emitted once when the protocol configuration PDA is created.
#[event]
pub struct ProtocolInitialized {
    pub config: Pubkey,
    pub version: u8,
}

/// Emitted when a maker creates an offer and deposits tokens into escrow.
#[event]
pub struct OfferCreated {
    pub offer: Pubkey,
    pub maker: Pubkey,
    pub offered_mint: Pubkey,
    pub requested_mint: Pubkey,
    pub offered_amount: u64,
    pub requested_amount: u64,
    pub expires_at: i64,
}

/// Emitted when a maker cancels an open offer and receives the escrow refund.
#[event]
pub struct OfferCancelled {
    pub offer: Pubkey,
    pub maker: Pubkey,
    pub refunded_amount: u64,
}

/// Emitted when an expired open offer is refunded permissionlessly to the maker.
#[event]
pub struct OfferExpired {
    pub offer: Pubkey,
    pub maker: Pubkey,
    pub refunded_amount: u64,
}
