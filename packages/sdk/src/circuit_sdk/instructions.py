"""Instruction builders for CIRCUIT."""

from __future__ import annotations

import struct
from typing import Sequence

from solders.instruction import AccountMeta, Instruction
from solders.pubkey import Pubkey

from .constants import CIRCUIT_PROGRAM_ID, OFFER_SEED, ESCROW_SEED
from .pda import _find_program_address

PROGRAM_ID = Pubkey.from_string(CIRCUIT_PROGRAM_ID)

CREATE_OFFER_DISC = bytes([237, 233, 192, 168, 248, 7, 249, 241])
CANCEL_OFFER_DISC = bytes([92, 203, 223, 40, 92, 89, 53, 119])
REFUND_EXPIRED_DISC = bytes([118, 153, 164, 244, 40, 128, 242, 250])
SETTLE_CYCLE_DISC = bytes([171, 180, 39, 74, 141, 164, 40, 217])

ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
TOKEN_PROGRAM_ID = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
SYSTEM_PROGRAM_ID = Pubkey.from_string("11111111111111111111111111111111")


def _to_pubkey(value) -> Pubkey:
    if isinstance(value, Pubkey):
        return value
    if isinstance(value, str):
        return Pubkey.from_string(value)
    if isinstance(value, (bytes, bytearray)):
        return Pubkey.from_bytes(bytes(value))
    raise TypeError(f"expected pubkey, got {type(value)}")


def find_offer_address_bytes(maker, nonce, program_id=PROGRAM_ID):
    maker_b = _to_pubkey(maker)
    addr, bump = _find_program_address([OFFER_SEED, bytes(maker_b), nonce.to_bytes(8, "little")], bytes(program_id))
    return Pubkey.from_bytes(addr), bump


def find_escrow_authority_address_bytes(offer, program_id=PROGRAM_ID):
    offer_b = _to_pubkey(offer)
    addr, bump = _find_program_address([ESCROW_SEED, bytes(offer_b)], bytes(program_id))
    return Pubkey.from_bytes(addr), bump


def build_create_offer(
    maker,
    nonce: int,
    offered_mint,
    requested_mint,
    offered_amount: int,
    requested_amount: int,
    expires_at: int,
    maker_offered_ata,
    escrow_ata,
    offer=None,
    escrow_authority=None,
    program_id=PROGRAM_ID,
) -> Instruction:
    from .amounts import to_u64, to_i64
    nonce = to_u64(nonce)
    offered_amount = to_u64(offered_amount)
    requested_amount = to_u64(requested_amount)
    expires_at = to_i64(expires_at)
    maker_pk = _to_pubkey(maker)
    if offer is None:
        offer, _ = find_offer_address_bytes(maker_pk, nonce, program_id)
    else:
        offer = _to_pubkey(offer)
    if escrow_authority is None:
        escrow_authority, _ = find_escrow_authority_address_bytes(offer, program_id)
    else:
        escrow_authority = _to_pubkey(escrow_authority)
    offered_mint_pk = _to_pubkey(offered_mint)
    requested_mint_pk = _to_pubkey(requested_mint)
    data = CREATE_OFFER_DISC + struct.pack("<QQQQq", nonce, offered_amount, requested_amount, 0, expires_at)
    # Wait: args order nonce, offered_amount, requested_amount, expires_at (no offered_mint/requested_mint args)
    data = CREATE_OFFER_DISC + struct.pack("<QQq", nonce, offered_amount, requested_amount) + struct.pack("<q", expires_at)
    # fix: nonce u64, offered_amount u64, requested_amount u64, expires_at i64
    data = CREATE_OFFER_DISC + struct.pack("<QQQq", nonce, offered_amount, requested_amount, expires_at)
    accounts = [
        AccountMeta(maker_pk, True, True),
        AccountMeta(offer, False, True),
        AccountMeta(offered_mint_pk, False, False),
        AccountMeta(requested_mint_pk, False, False),
        AccountMeta(_to_pubkey(maker_offered_ata), False, True),
        AccountMeta(escrow_authority, False, False),
        AccountMeta(_to_pubkey(escrow_ata), False, True),
        AccountMeta(TOKEN_PROGRAM_ID, False, False),
        AccountMeta(ASSOCIATED_TOKEN_PROGRAM_ID, False, False),
        AccountMeta(SYSTEM_PROGRAM_ID, False, False),
    ]
    return Instruction(program_id, data, accounts)


def build_cancel_offer(maker, offer, offered_mint, escrow_authority, escrow_ata, maker_token_account, program_id=PROGRAM_ID) -> Instruction:
    maker_pk = _to_pubkey(maker)
    offer_pk = _to_pubkey(offer)
    accounts = [
        AccountMeta(maker_pk, True, False),
        AccountMeta(offer_pk, False, True),
        AccountMeta(_to_pubkey(offered_mint), False, False),
        AccountMeta(_to_pubkey(escrow_authority), False, False),
        AccountMeta(_to_pubkey(escrow_ata), False, True),
        AccountMeta(_to_pubkey(maker_token_account), False, True),
        AccountMeta(TOKEN_PROGRAM_ID, False, False),
    ]
    return Instruction(program_id, CANCEL_OFFER_DISC, accounts)


def build_refund_expired(caller, offer, maker, offered_mint, escrow_authority, escrow_ata, maker_token_account, program_id=PROGRAM_ID) -> Instruction:
    accounts = [
        AccountMeta(_to_pubkey(caller), True, True),
        AccountMeta(_to_pubkey(offer), False, True),
        AccountMeta(_to_pubkey(maker), False, False),
        AccountMeta(_to_pubkey(offered_mint), False, False),
        AccountMeta(_to_pubkey(escrow_authority), False, False),
        AccountMeta(_to_pubkey(escrow_ata), False, True),
        AccountMeta(_to_pubkey(maker_token_account), False, True),
        AccountMeta(TOKEN_PROGRAM_ID, False, False),
    ]
    return Instruction(program_id, REFUND_EXPIRED_DISC, accounts)


def build_settle_cycle(
    offer_a, offer_b, offer_c,
    mint_x, mint_y, mint_z,
    escrow_authority_a, escrow_authority_b, escrow_authority_c,
    escrow_ata_a, escrow_ata_b, escrow_ata_c,
    dest_c_receives_x, dest_a_receives_y, dest_b_receives_z,
    excess_refund_a, excess_refund_b, excess_refund_c,
    maker_a, maker_b, maker_c,
    program_id=PROGRAM_ID,
) -> Instruction:
    accounts = [
        AccountMeta(_to_pubkey(offer_a), False, True),
        AccountMeta(_to_pubkey(offer_b), False, True),
        AccountMeta(_to_pubkey(offer_c), False, True),
        AccountMeta(_to_pubkey(mint_x), False, False),
        AccountMeta(_to_pubkey(mint_y), False, False),
        AccountMeta(_to_pubkey(mint_z), False, False),
        AccountMeta(_to_pubkey(escrow_authority_a), False, False),
        AccountMeta(_to_pubkey(escrow_authority_b), False, False),
        AccountMeta(_to_pubkey(escrow_authority_c), False, False),
        AccountMeta(_to_pubkey(escrow_ata_a), False, True),
        AccountMeta(_to_pubkey(escrow_ata_b), False, True),
        AccountMeta(_to_pubkey(escrow_ata_c), False, True),
        AccountMeta(_to_pubkey(dest_c_receives_x), False, True),
        AccountMeta(_to_pubkey(dest_a_receives_y), False, True),
        AccountMeta(_to_pubkey(dest_b_receives_z), False, True),
        AccountMeta(_to_pubkey(excess_refund_a), False, True),
        AccountMeta(_to_pubkey(excess_refund_b), False, True),
        AccountMeta(_to_pubkey(excess_refund_c), False, True),
        AccountMeta(_to_pubkey(maker_a), False, True),
        AccountMeta(_to_pubkey(maker_b), False, True),
        AccountMeta(_to_pubkey(maker_c), False, True),
        AccountMeta(TOKEN_PROGRAM_ID, False, False),
    ]
    assert len(accounts) == 22
    return Instruction(program_id, SETTLE_CYCLE_DISC, accounts)
