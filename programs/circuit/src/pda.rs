use anchor_lang::prelude::*;

use crate::constants::{ESCROW_SEED, OFFER_SEED};

pub fn find_offer_pda(maker: &Pubkey, nonce: u64, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[OFFER_SEED, maker.as_ref(), &nonce.to_le_bytes()],
        program_id,
    )
}

pub fn find_escrow_authority_pda(offer: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[ESCROW_SEED, offer.as_ref()], program_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn offer_pda_is_deterministic() {
        let program_id = Pubkey::new_unique();
        let maker = Pubkey::new_unique();
        let (a1, b1) = find_offer_pda(&maker, 7, &program_id);
        let (a2, b2) = find_offer_pda(&maker, 7, &program_id);
        assert_eq!(a1, a2);
        assert_eq!(b1, b2);
        let (a3, _) = find_offer_pda(&maker, 8, &program_id);
        assert_ne!(a1, a3);
    }

    #[test]
    fn escrow_authority_pda_is_deterministic() {
        let program_id = Pubkey::new_unique();
        let offer = Pubkey::new_unique();
        let (a1, b1) = find_escrow_authority_pda(&offer, &program_id);
        let (a2, b2) = find_escrow_authority_pda(&offer, &program_id);
        assert_eq!(a1, a2);
        assert_eq!(b1, b2);
        let (a3, _) = find_escrow_authority_pda(&Pubkey::new_unique(), &program_id);
        assert_ne!(a1, a3);
    }

    #[test]
    fn offer_pda_is_off_curve_canonical() {
        let program_id = Pubkey::new_unique();
        let maker = Pubkey::new_unique();
        let nonce = 42u64;
        let (pda, bump) = find_offer_pda(&maker, nonce, &program_id);
        assert!(!pda.is_on_curve());
        let recreated = Pubkey::create_program_address(
            &[OFFER_SEED, maker.as_ref(), &nonce.to_le_bytes(), &[bump]],
            &program_id,
        )
        .expect("canonical bump recreates offer PDA");
        assert_eq!(pda, recreated);
    }

    #[test]
    fn escrow_authority_pda_is_off_curve_canonical() {
        let program_id = Pubkey::new_unique();
        let offer = Pubkey::new_unique();
        let (pda, bump) = find_escrow_authority_pda(&offer, &program_id);
        assert!(!pda.is_on_curve());
        let recreated =
            Pubkey::create_program_address(&[ESCROW_SEED, offer.as_ref(), &[bump]], &program_id)
                .expect("canonical bump recreates escrow authority PDA");
        assert_eq!(pda, recreated);
    }

    #[test]
    fn pda_seeds_match_constants() {
        assert_eq!(OFFER_SEED, b"offer");
        assert_eq!(ESCROW_SEED, b"escrow");
    }
}
