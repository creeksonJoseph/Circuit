use anchor_lang::prelude::*;

/// Protocol-level configuration.
///
/// Stage 1 only stores a layout version and the canonical PDA bump. Future
/// stages may add fields through an explicit, reviewed migration.
#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub version: u8,
    pub bump: u8,
}
