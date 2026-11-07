use anchor_lang::prelude::*;

/// Emitted once when the protocol configuration PDA is created.
#[event]
pub struct ProtocolInitialized {
    pub config: Pubkey,
    pub version: u8,
}
