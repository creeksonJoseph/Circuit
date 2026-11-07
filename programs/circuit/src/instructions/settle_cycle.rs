use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, TransferChecked};

use crate::constants::{ESCROW_SEED, OFFER_SEED};
use crate::error::CircuitError;
use crate::events::CycleSettled;
use crate::state::{Offer, OfferStatus};

#[derive(Accounts)]
pub struct SettleCycle<'info> {
    #[account(
        mut,
        seeds = [OFFER_SEED, offer_a.maker.as_ref(), &offer_a.nonce.to_le_bytes()],
        bump = offer_a.bump
    )]
    pub offer_a: Box<Account<'info, Offer>>,

    #[account(
        mut,
        seeds = [OFFER_SEED, offer_b.maker.as_ref(), &offer_b.nonce.to_le_bytes()],
        bump = offer_b.bump
    )]
    pub offer_b: Box<Account<'info, Offer>>,

    #[account(
        mut,
        seeds = [OFFER_SEED, offer_c.maker.as_ref(), &offer_c.nonce.to_le_bytes()],
        bump = offer_c.bump
    )]
    pub offer_c: Box<Account<'info, Offer>>,

    #[account(address = offer_a.offered_mint)]
    pub mint_x: Box<Account<'info, Mint>>,

    #[account(address = offer_b.offered_mint)]
    pub mint_y: Box<Account<'info, Mint>>,

    #[account(address = offer_c.offered_mint)]
    pub mint_z: Box<Account<'info, Mint>>,

    /// CHECK: PDA signing authority for escrow_ata_a; validated by mandatory seeds + stored bump.
    #[account(
        seeds = [ESCROW_SEED, offer_a.key().as_ref()],
        bump = offer_a.escrow_bump
    )]
    pub escrow_authority_a: UncheckedAccount<'info>,

    /// CHECK: PDA signing authority for escrow_ata_b; validated by mandatory seeds + stored bump.
    #[account(
        seeds = [ESCROW_SEED, offer_b.key().as_ref()],
        bump = offer_b.escrow_bump
    )]
    pub escrow_authority_b: UncheckedAccount<'info>,

    /// CHECK: PDA signing authority for escrow_ata_c; validated by mandatory seeds + stored bump.
    #[account(
        seeds = [ESCROW_SEED, offer_c.key().as_ref()],
        bump = offer_c.escrow_bump
    )]
    pub escrow_authority_c: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = escrow_authority_a,
        associated_token::token_program = token_program
    )]
    pub escrow_ata_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = escrow_authority_b,
        associated_token::token_program = token_program
    )]
    pub escrow_ata_b: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_z,
        associated_token::authority = escrow_authority_c,
        associated_token::token_program = token_program
    )]
    pub escrow_ata_c: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_x,
        token::authority = offer_c.maker
    )]
    pub dest_c_receives_x: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_y,
        token::authority = offer_a.maker
    )]
    pub dest_a_receives_y: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_z,
        token::authority = offer_b.maker
    )]
    pub dest_b_receives_z: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_x,
        token::authority = offer_a.maker
    )]
    pub excess_refund_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_y,
        token::authority = offer_b.maker
    )]
    pub excess_refund_b: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint_z,
        token::authority = offer_c.maker
    )]
    pub excess_refund_c: Box<Account<'info, TokenAccount>>,

    /// CHECK: Writable lamport rent recipient for closing escrow_ata_a; constrained to offer_a.maker.
    #[account(mut, address = offer_a.maker)]
    pub maker_a: UncheckedAccount<'info>,

    /// CHECK: Writable lamport rent recipient for closing escrow_ata_b; constrained to offer_b.maker.
    #[account(mut, address = offer_b.maker)]
    pub maker_b: UncheckedAccount<'info>,

    /// CHECK: Writable lamport rent recipient for closing escrow_ata_c; constrained to offer_c.maker.
    #[account(mut, address = offer_c.maker)]
    pub maker_c: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_settle_cycle(ctx: Context<SettleCycle>) -> Result<()> {
    let (
        offer_a_key,
        offer_b_key,
        offer_c_key,
        maker_a_key,
        maker_b_key,
        maker_c_key,
        escrow_bump_a,
        escrow_bump_b,
        escrow_bump_c,
        offered_amount_a,
        offered_amount_b,
        offered_amount_c,
        mint_x_decimals,
        mint_y_decimals,
        mint_z_decimals,
    ) = {
        let offer_a = &ctx.accounts.offer_a;
        let offer_b = &ctx.accounts.offer_b;
        let offer_c = &ctx.accounts.offer_c;

        require_keys_neq!(offer_a.key(), offer_b.key(), CircuitError::DuplicateOffer);
        require_keys_neq!(offer_a.key(), offer_c.key(), CircuitError::DuplicateOffer);
        require_keys_neq!(offer_b.key(), offer_c.key(), CircuitError::DuplicateOffer);

        require_keys_neq!(offer_a.maker, offer_b.maker, CircuitError::DuplicateMaker);
        require_keys_neq!(offer_a.maker, offer_c.maker, CircuitError::DuplicateMaker);
        require_keys_neq!(offer_b.maker, offer_c.maker, CircuitError::DuplicateMaker);

        require_keys_neq!(
            offer_a.offered_mint,
            offer_b.offered_mint,
            CircuitError::DuplicateOfferedMint
        );
        require_keys_neq!(
            offer_a.offered_mint,
            offer_c.offered_mint,
            CircuitError::DuplicateOfferedMint
        );
        require_keys_neq!(
            offer_b.offered_mint,
            offer_c.offered_mint,
            CircuitError::DuplicateOfferedMint
        );

        require!(
            offer_a.requested_amount == offer_b.offered_amount,
            CircuitError::InvalidSettlementCycle
        );
        require!(
            offer_b.requested_amount == offer_c.offered_amount,
            CircuitError::InvalidSettlementCycle
        );
        require!(
            offer_c.requested_amount == offer_a.offered_amount,
            CircuitError::InvalidSettlementCycle
        );

        require!(
            offer_a.requested_mint == offer_b.offered_mint,
            CircuitError::InvalidSettlementCycle
        );
        require!(
            offer_b.requested_mint == offer_c.offered_mint,
            CircuitError::InvalidSettlementCycle
        );
        require!(
            offer_c.requested_mint == offer_a.offered_mint,
            CircuitError::InvalidSettlementCycle
        );

        require!(
            offer_a.status == OfferStatus::Open,
            CircuitError::OfferNotOpen
        );
        require!(
            offer_b.status == OfferStatus::Open,
            CircuitError::OfferNotOpen
        );
        require!(
            offer_c.status == OfferStatus::Open,
            CircuitError::OfferNotOpen
        );

        let now = Clock::get()?.unix_timestamp;
        require!(now < offer_a.expires_at, CircuitError::SettlementExpired);
        require!(now < offer_b.expires_at, CircuitError::SettlementExpired);
        require!(now < offer_c.expires_at, CircuitError::SettlementExpired);

        (
            offer_a.key(),
            offer_b.key(),
            offer_c.key(),
            offer_a.maker,
            offer_b.maker,
            offer_c.maker,
            offer_a.escrow_bump,
            offer_b.escrow_bump,
            offer_c.escrow_bump,
            offer_a.offered_amount,
            offer_b.offered_amount,
            offer_c.offered_amount,
            ctx.accounts.mint_x.decimals,
            ctx.accounts.mint_y.decimals,
            ctx.accounts.mint_z.decimals,
        )
    };

    let excess_a = ctx
        .accounts
        .escrow_ata_a
        .amount
        .checked_sub(offered_amount_a)
        .ok_or(CircuitError::InsufficientEscrowBalance)?;
    let excess_b = ctx
        .accounts
        .escrow_ata_b
        .amount
        .checked_sub(offered_amount_b)
        .ok_or(CircuitError::InsufficientEscrowBalance)?;
    let excess_c = ctx
        .accounts
        .escrow_ata_c
        .amount
        .checked_sub(offered_amount_c)
        .ok_or(CircuitError::InsufficientEscrowBalance)?;

    settle_leg(
        ctx.accounts.token_program.key(),
        ctx.accounts.escrow_ata_a.to_account_info(),
        ctx.accounts.mint_x.to_account_info(),
        ctx.accounts.dest_c_receives_x.to_account_info(),
        ctx.accounts.excess_refund_a.to_account_info(),
        ctx.accounts.maker_a.to_account_info(),
        ctx.accounts.escrow_authority_a.to_account_info(),
        offer_a_key,
        escrow_bump_a,
        offered_amount_a,
        excess_a,
        mint_x_decimals,
    )?;
    settle_leg(
        ctx.accounts.token_program.key(),
        ctx.accounts.escrow_ata_b.to_account_info(),
        ctx.accounts.mint_y.to_account_info(),
        ctx.accounts.dest_a_receives_y.to_account_info(),
        ctx.accounts.excess_refund_b.to_account_info(),
        ctx.accounts.maker_b.to_account_info(),
        ctx.accounts.escrow_authority_b.to_account_info(),
        offer_b_key,
        escrow_bump_b,
        offered_amount_b,
        excess_b,
        mint_y_decimals,
    )?;
    settle_leg(
        ctx.accounts.token_program.key(),
        ctx.accounts.escrow_ata_c.to_account_info(),
        ctx.accounts.mint_z.to_account_info(),
        ctx.accounts.dest_b_receives_z.to_account_info(),
        ctx.accounts.excess_refund_c.to_account_info(),
        ctx.accounts.maker_c.to_account_info(),
        ctx.accounts.escrow_authority_c.to_account_info(),
        offer_c_key,
        escrow_bump_c,
        offered_amount_c,
        excess_c,
        mint_z_decimals,
    )?;

    ctx.accounts.offer_a.status = OfferStatus::Settled;
    ctx.accounts.offer_b.status = OfferStatus::Settled;
    ctx.accounts.offer_c.status = OfferStatus::Settled;

    emit!(CycleSettled {
        offer_a: offer_a_key,
        offer_b: offer_b_key,
        offer_c: offer_c_key,
        maker_a: maker_a_key,
        maker_b: maker_b_key,
        maker_c: maker_c_key,
        mint_x: ctx.accounts.mint_x.key(),
        mint_y: ctx.accounts.mint_y.key(),
        mint_z: ctx.accounts.mint_z.key(),
        agreed_amount_a: offered_amount_a,
        agreed_amount_b: offered_amount_b,
        agreed_amount_c: offered_amount_c,
        excess_refunded_a: excess_a,
        excess_refunded_b: excess_b,
        excess_refunded_c: excess_c,
    });

    Ok(())
}

#[allow(clippy::too_many_arguments)]
#[inline(never)]
fn settle_leg<'info>(
    token_program_key: Pubkey,
    escrow_ata: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    counterparty_dest: AccountInfo<'info>,
    excess_refund: AccountInfo<'info>,
    rent_dest: AccountInfo<'info>,
    escrow_authority: AccountInfo<'info>,
    offer_key: Pubkey,
    escrow_bump: u8,
    agreed_amount: u64,
    excess_amount: u64,
    decimals: u8,
) -> Result<()> {
    let signer_seeds: &[&[&[u8]]] = &[&[ESCROW_SEED, offer_key.as_ref(), &[escrow_bump]]];

    let transfer_accounts = TransferChecked {
        from: escrow_ata.clone(),
        mint: mint.clone(),
        to: counterparty_dest,
        authority: escrow_authority.clone(),
    };
    let transfer_ctx =
        CpiContext::new_with_signer(token_program_key, transfer_accounts, signer_seeds);
    token::transfer_checked(transfer_ctx, agreed_amount, decimals)?;

    if excess_amount > 0 {
        let refund_accounts = TransferChecked {
            from: escrow_ata.clone(),
            mint: mint.clone(),
            to: excess_refund,
            authority: escrow_authority.clone(),
        };
        let refund_ctx =
            CpiContext::new_with_signer(token_program_key, refund_accounts, signer_seeds);
        token::transfer_checked(refund_ctx, excess_amount, decimals)?;
    }

    let close_accounts = CloseAccount {
        account: escrow_ata,
        destination: rent_dest,
        authority: escrow_authority,
    };
    let close_ctx = CpiContext::new_with_signer(token_program_key, close_accounts, signer_seeds);
    token::close_account(close_ctx)?;
    Ok(())
}
