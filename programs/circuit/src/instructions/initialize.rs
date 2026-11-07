use anchor_lang::prelude::*;

use crate::constants::{CONFIG_SEED, PROTOCOL_VERSION};
use crate::events::ProtocolInitialized;
use crate::state::ProtocolConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + ProtocolConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.version = PROTOCOL_VERSION;
    config.bump = ctx.bumps.config;

    emit!(ProtocolInitialized {
        config: config.key(),
        version: config.version,
    });

    Ok(())
}
