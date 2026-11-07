use anchor_lang::prelude::*;

/// Errors returned by CIRCUIT instructions.
#[error_code]
pub enum CircuitError {
    #[msg("The protocol configuration account is not initialised")]
    Uninitialized,

    #[msg("The offered amount must be greater than zero")]
    ZeroOfferedAmount,

    #[msg("The requested amount must be greater than zero")]
    ZeroRequestedAmount,

    #[msg("Offered and requested mints must differ")]
    SameMint,

    #[msg("The expiry must be in the future")]
    PastExpiry,

    #[msg("The maker's token account has insufficient balance")]
    InsufficientBalance,

    #[msg("Only the offer maker may perform this action")]
    NotMaker,

    #[msg("The offer is not open")]
    OfferNotOpen,

    #[msg("The offer has not expired")]
    NotExpired,

    #[msg("The settlement cycle has expired")]
    SettlementExpired,

    #[msg("The escrow account has insufficient balance for the settlement")]
    InsufficientEscrowBalance,

    #[msg("The offer cycle amounts or mints do not form a valid settlement cycle")]
    InvalidSettlementCycle,

    #[msg("Duplicate offer in the settlement cycle")]
    DuplicateOffer,

    #[msg("Duplicate maker in the settlement cycle")]
    DuplicateMaker,

    #[msg("Duplicate offered mint in the settlement cycle")]
    DuplicateOfferedMint,
}
