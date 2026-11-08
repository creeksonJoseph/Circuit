import struct

from solders.pubkey import Pubkey

from circuit_sdk import (
    build_cancel_offer,
    build_create_offer,
    build_refund_expired,
    build_settle_cycle,
)
from circuit_sdk.constants import CIRCUIT_PROGRAM_ID

PROGRAM_ID = Pubkey.from_string(CIRCUIT_PROGRAM_ID)
DUMMY = Pubkey.from_bytes(bytes([1] * 32))


def test_create_offer_discriminator_and_args():
    ix = build_create_offer(
        maker=DUMMY, nonce=7, offered_mint=DUMMY, requested_mint=DUMMY,
        offered_amount=10, requested_amount=20, expires_at=123,
        maker_offered_ata=DUMMY, escrow_ata=DUMMY,
    )
    assert ix.program_id == PROGRAM_ID
    assert bytes(ix.data[:8]) == bytes([237, 233, 192, 168, 248, 7, 249, 241])
    assert struct.unpack("<QQQq", ix.data[8:]) == (7, 10, 20, 123)
    assert len(ix.accounts) == 10
    assert ix.accounts[0].is_signer is True
    assert ix.accounts[0].is_writable is True


def test_cancel_offer_basic():
    ix = build_cancel_offer(DUMMY, DUMMY, DUMMY, DUMMY, DUMMY, DUMMY)
    assert ix.program_id == PROGRAM_ID
    assert bytes(ix.data) == bytes([92, 203, 223, 40, 92, 89, 53, 119])
    assert len(ix.accounts) == 7


def test_refund_expired_basic():
    ix = build_refund_expired(DUMMY, DUMMY, DUMMY, DUMMY, DUMMY, DUMMY, DUMMY)
    assert ix.program_id == PROGRAM_ID
    assert bytes(ix.data) == bytes([118, 153, 164, 244, 40, 128, 242, 250])
    assert len(ix.accounts) == 8
    assert ix.accounts[0].is_signer is True


def test_settle_cycle_account_count_and_flags():
    args = [DUMMY] * 21
    ix = build_settle_cycle(*args)
    assert ix.program_id == PROGRAM_ID
    assert bytes(ix.data) == bytes([171, 180, 39, 74, 141, 164, 40, 217])
    assert len(ix.accounts) == 22
    # writable checks: offers and escrows and dests and makers writable
    for i in [0,1,2,9,10,11,12,13,14,15,16,17,18,19,20]:
        assert ix.accounts[i].is_writable is True, i
    for i in [3,4,5,6,7,8,21]:
        assert ix.accounts[i].is_writable is False, i
    for a in ix.accounts:
        assert a.is_signer is False
