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
}
