use anchor_lang::prelude::*;

/// Errors reserved for the CIRCUIT program.
///
/// Stage 1 only needs the scaffold error type so later stages can add
/// instruction-specific variants without changing the module layout.
#[error_code]
pub enum CircuitError {
    #[msg("The protocol configuration account is not initialised")]
    Uninitialized,
}
