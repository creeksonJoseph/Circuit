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

/// Emitted when a three-offer settlement cycle is atomically settled.
/// Distinguishes agreed settlement amounts from excess refunds.
#[event]
pub struct CycleSettled {
    pub offer_a: Pubkey,
    pub offer_b: Pubkey,
    pub offer_c: Pubkey,
    pub maker_a: Pubkey,
    pub maker_b: Pubkey,
    pub maker_c: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub mint_z: Pubkey,
    pub agreed_amount_a: u64,
    pub agreed_amount_b: u64,
    pub agreed_amount_c: u64,
    pub excess_refunded_a: u64,
    pub excess_refunded_b: u64,
    pub excess_refunded_c: u64,
}
