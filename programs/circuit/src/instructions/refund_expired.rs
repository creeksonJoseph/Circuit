use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, TransferChecked};

use crate::constants::{ESCROW_SEED, OFFER_SEED};
use crate::error::CircuitError;
use crate::events::OfferExpired;
use crate::state::{Offer, OfferStatus};

#[derive(Accounts)]
pub struct RefundExpired<'info> {
    /// Pays transaction fees only; must never receive escrow tokens or rent.
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [OFFER_SEED, offer.maker.as_ref(), &offer.nonce.to_le_bytes()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    /// Receives escrow ATA rent on close. Must be the offer maker.
    #[account(
        mut,
        address = offer.maker
    )]
    pub maker: SystemAccount<'info>,

    #[account(
        address = offer.offered_mint
    )]
    pub offered_mint: Account<'info, Mint>,

    /// CHECK: PDA signing authority for the escrow token account. Validated by mandatory
    /// Anchor seeds + bump constraints against stored offer data.
    #[account(
        seeds = [ESCROW_SEED, offer.key().as_ref()],
        bump = offer.escrow_bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = offered_mint,
        associated_token::authority = escrow_authority,
        associated_token::token_program = token_program
    )]
    pub escrow_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = offered_mint,
        token::authority = offer.maker
    )]
    pub maker_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_refund_expired(ctx: Context<RefundExpired>) -> Result<()> {
    require!(
        ctx.accounts.offer.status == OfferStatus::Open,
        CircuitError::OfferNotOpen
    );
    let now = Clock::get()?.unix_timestamp;
    require!(
        now >= ctx.accounts.offer.expires_at,
        CircuitError::NotExpired
    );

    let refunded_amount = ctx.accounts.escrow_ata.amount;
    let offer_key = ctx.accounts.offer.key();
    let escrow_bump = ctx.accounts.offer.escrow_bump;
    let signer_seeds: &[&[&[u8]]] = &[&[ESCROW_SEED, offer_key.as_ref(), &[escrow_bump]]];

    let transfer_accounts = TransferChecked {
        from: ctx.accounts.escrow_ata.to_account_info(),
        mint: ctx.accounts.offered_mint.to_account_info(),
        to: ctx.accounts.maker_token_account.to_account_info(),
        authority: ctx.accounts.escrow_authority.to_account_info(),
    };
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        transfer_accounts,
        signer_seeds,
    );
    token::transfer_checked(
        transfer_ctx,
        refunded_amount,
        ctx.accounts.offered_mint.decimals,
    )?;

    let close_accounts = CloseAccount {
        account: ctx.accounts.escrow_ata.to_account_info(),
        destination: ctx.accounts.maker.to_account_info(),
        authority: ctx.accounts.escrow_authority.to_account_info(),
    };
    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        close_accounts,
        signer_seeds,
    );
    token::close_account(close_ctx)?;

    let offer = &mut ctx.accounts.offer;
    offer.status = OfferStatus::Expired;

    emit!(OfferExpired {
        offer: offer.key(),
        maker: offer.maker,
        refunded_amount,
    });

    Ok(())
}
