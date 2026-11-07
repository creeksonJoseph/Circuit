use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, TransferChecked};

use crate::constants::{ESCROW_SEED, OFFER_SEED, PROTOCOL_VERSION};
use crate::error::CircuitError;
use crate::events::OfferCreated;
use crate::state::{Offer, OfferStatus};

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct CreateOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    /// Offer PDA is declared before `escrow_authority` so `offer.key()` is available
    /// for the escrow authority PDA seeds.
    #[account(
        init,
        payer = maker,
        space = 8 + Offer::INIT_SPACE,
        seeds = [OFFER_SEED, maker.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    pub offered_mint: Account<'info, Mint>,

    pub requested_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint = offered_mint,
        token::authority = maker
    )]
    pub maker_offered_ata: Account<'info, TokenAccount>,

    /// CHECK: PDA signing authority for the escrow token account. Validated by mandatory
    /// Anchor seeds + bump constraints; not initialized and has no allocated account/owner.
    #[account(
        seeds = [ESCROW_SEED, offer.key().as_ref()],
        bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = offered_mint,
        associated_token::authority = escrow_authority,
        associated_token::token_program = token_program
    )]
    pub escrow_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_offer(
    ctx: Context<CreateOffer>,
    nonce: u64,
    offered_amount: u64,
    requested_amount: u64,
    expires_at: i64,
) -> Result<()> {
    require!(offered_amount > 0, CircuitError::ZeroOfferedAmount);
    require!(requested_amount > 0, CircuitError::ZeroRequestedAmount);
    require_keys_neq!(
        ctx.accounts.offered_mint.key(),
        ctx.accounts.requested_mint.key(),
        CircuitError::SameMint
    );
    let now = Clock::get()?.unix_timestamp;
    require!(expires_at > now, CircuitError::PastExpiry);
    require!(
        ctx.accounts.maker_offered_ata.amount >= offered_amount,
        CircuitError::InsufficientBalance
    );

    let offer = &mut ctx.accounts.offer;
    offer.version = PROTOCOL_VERSION;
    offer.bump = ctx.bumps.offer;
    offer.escrow_bump = ctx.bumps.escrow_authority;
    offer.status = OfferStatus::Open;
    offer.maker = ctx.accounts.maker.key();
    offer.nonce = nonce;
    offer.offered_mint = ctx.accounts.offered_mint.key();
    offer.requested_mint = ctx.accounts.requested_mint.key();
    offer.offered_amount = offered_amount;
    offer.requested_amount = requested_amount;
    offer.created_at = now;
    offer.expires_at = expires_at;

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.maker_offered_ata.to_account_info(),
        mint: ctx.accounts.offered_mint.to_account_info(),
        to: ctx.accounts.escrow_ata.to_account_info(),
        authority: ctx.accounts.maker.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.key(), cpi_accounts);
    token::transfer_checked(cpi_ctx, offered_amount, ctx.accounts.offered_mint.decimals)?;

    emit!(OfferCreated {
        offer: ctx.accounts.offer.key(),
        maker: ctx.accounts.maker.key(),
        offered_mint: ctx.accounts.offered_mint.key(),
        requested_mint: ctx.accounts.requested_mint.key(),
        offered_amount,
        requested_amount,
        expires_at,
    });

    Ok(())
}
