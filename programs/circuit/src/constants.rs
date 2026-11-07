/// Seed for the protocol configuration PDA.
pub const CONFIG_SEED: &[u8] = b"config";

/// Current on-chain protocol layout version.
pub const PROTOCOL_VERSION: u8 = 1;

/// Seed for offer PDAs: [OFFER_SEED, maker, nonce_le]
pub const OFFER_SEED: &[u8] = b"offer";

/// Seed for escrow authority PDAs: [ESCROW_SEED, offer_pubkey]
pub const ESCROW_SEED: &[u8] = b"escrow";
