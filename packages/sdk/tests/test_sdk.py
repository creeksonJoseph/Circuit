import builtins

import pytest

import hashlib

from circuit_sdk import (
    CIRCUIT_PROGRAM_ID,
    DEFAULT_RPC_URL,
    ESCROW_SEED,
    OFFER_SEED,
    PROTOCOL_VERSION,
    CircuitSDK,
    find_escrow_authority_address,
    find_offer_address,
)
from circuit_sdk import pda as pda_mod


def _solders():
    try:
        from solders.pubkey import Pubkey

        return Pubkey
    except ImportError:
        return None



def test_protocol_version_matches_stage_one() -> None:
    assert PROTOCOL_VERSION == 1


def test_client_defaults_are_public_and_local() -> None:
    sdk = CircuitSDK()

    assert sdk.program_id == CIRCUIT_PROGRAM_ID
    assert sdk.rpc_url == DEFAULT_RPC_URL
    assert sdk.describe() == {
        "rpc_url": DEFAULT_RPC_URL,
        "program_id": CIRCUIT_PROGRAM_ID,
        "protocol_version": PROTOCOL_VERSION,
    }


def test_client_accepts_overrides() -> None:
    sdk = CircuitSDK(rpc_url="http://example.invalid:8899", program_id="11111111111111111111111111111111")

    assert sdk.rpc_url == "http://example.invalid:8899"
    assert sdk.program_id == "11111111111111111111111111111111"


def test_stage2_pda_seed_constants() -> None:
    assert OFFER_SEED == b"offer"
    assert ESCROW_SEED == b"escrow"


def test_find_offer_address_deterministic() -> None:
    maker = bytes(32)
    program_id = bytes([1] * 32)
    a1, b1 = find_offer_address(maker, 7, program_id)
    a2, b2 = find_offer_address(maker, 7, program_id)
    assert a1 == a2
    assert b1 == b2
    a3, _ = find_offer_address(maker, 8, program_id)
    assert a1 != a3


def test_find_escrow_authority_address_deterministic() -> None:
    offer = bytes([2] * 32)
    program_id = bytes([1] * 32)
    a1, b1 = find_escrow_authority_address(offer, program_id)
    a2, b2 = find_escrow_authority_address(offer, program_id)
    assert a1 == a2
    assert b1 == b2
    a3, _ = find_escrow_authority_address(bytes([3] * 32), program_id)
    assert a1 != a3


def test_is_on_curve_normal_behavior() -> None:
    # Ed25519 basepoint (compressed y=9, little-endian x/sign byte layout used by libsodium) is on-curve.
    basepoint = bytes([9] + [0] * 31)
    assert pda_mod._is_on_curve(basepoint) is True

    # A derived PDA should be off-curve.
    maker = bytes(32)
    program_id = bytes([1] * 32)
    addr, _ = find_offer_address(maker, 7, program_id)
    assert pda_mod._is_on_curve(addr) is False


def test_is_on_curve_missing_dependency_raises_clear_error(monkeypatch) -> None:
    real_import = builtins.__import__

    def fake_import(name, globals=None, locals=None, fromlist=(), level=0):
        if name == "solders.pubkey" or name == "solders" or name.startswith("solders."):
            raise ImportError("mocked missing solders")
        return real_import(name, globals, locals, fromlist, level)

    monkeypatch.setattr(builtins, "__import__", fake_import)
    with pytest.raises(RuntimeError) as excinfo:
        pda_mod._is_on_curve(bytes(32))
    msg = str(excinfo.value)
    assert "solders is required" in msg
    assert "circuit_sdk.pda" in msg
    assert "pip install" in msg or "uv sync" in msg


def test_is_on_curve_matches_solders_differential() -> None:
    Pubkey = _solders()
    if Pubkey is None:
        pytest.skip("solders not installed; differential check requires Solana-compatible reference")

    # Known edge cases: identity and small-order-like encodings were observed to
    # differ between libsodium's is_valid_point and Solana/solders semantics.
    cases = [bytes(32), bytes([1] + [0] * 31), bytes([9] + [0] * 31)]
    for i in range(512):
        cases.append(hashlib.sha256(f"curve-case-{i}".encode()).digest())
    p = 2**255 - 19
    for y in [0, 1, 2, p - 1, p - 2]:
        cases.append(y.to_bytes(32, "little"))

    for c in cases:
        expected = bool(Pubkey.from_bytes(c).is_on_curve())
        assert pda_mod._is_on_curve(c) is expected


def test_find_program_address_matches_solders() -> None:
    Pubkey = _solders()
    if Pubkey is None:
        pytest.skip("solders not installed; PDA derivation reference requires Solana-compatible implementation")

    program_id = bytes(Pubkey.from_string("4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc"))
    makers = [bytes(32), bytes([7]) * 32, hashlib.sha256(b"maker").digest()]
    for maker in makers:
        for nonce in (0, 1, 7, 255, 2**64 - 1):
            ours_addr, ours_bump = find_offer_address(maker, nonce, program_id)
            ref_addr, ref_bump = Pubkey.find_program_address(
                [OFFER_SEED, maker, nonce.to_bytes(8, "little")],
                Pubkey.from_bytes(program_id),
            )
            assert ours_addr == bytes(ref_addr)
            assert ours_bump == ref_bump
            assert pda_mod._is_on_curve(ours_addr) is False

    for offer in (bytes([2]) * 32, hashlib.sha256(b"offer").digest()):
        ours_addr, ours_bump = find_escrow_authority_address(offer, program_id)
        ref_addr, ref_bump = Pubkey.find_program_address(
            [ESCROW_SEED, offer],
            Pubkey.from_bytes(program_id),
        )
        assert ours_addr == bytes(ref_addr)
        assert ours_bump == ref_bump
        assert pda_mod._is_on_curve(ours_addr) is False
