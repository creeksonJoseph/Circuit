"""PDA derivation helpers for CIRCUIT (Stage 2).

Helpers mirror the on-chain seed layout and Solana's PDA semantics.
"""

from __future__ import annotations

import hashlib
from typing import Tuple

from .constants import ESCROW_SEED, OFFER_SEED

PDA_MARKER = b"ProgramDerivedAddress"


def _find_program_address(seeds: list[bytes], program_id: bytes) -> Tuple[bytes, int]:
    for bump in range(255, -1, -1):
        h = hashlib.sha256()
        for seed in seeds:
            h.update(seed)
        h.update(bytes([bump]))
        h.update(program_id)
        h.update(PDA_MARKER)
        digest = h.digest()
        if not _is_on_curve(digest):
            return digest, bump
    raise ValueError("Unable to find a valid PDA")


def _is_on_curve(pubkey_bytes: bytes) -> bool:
    """Return True if *pubkey_bytes* is on the ed25519 curve per Solana semantics.

    Solana's ``bytes_are_curve_point`` / ``is_on_curve`` uses
    ``curve25519_dalek::edwards::CompressedEdwardsY::decompress().is_some()``.
    This implementation delegates to ``solders.Pubkey.is_on_curve()`` (Solana's
    Rust implementation via bindings) for exact compatibility.

    Raises a clear, actionable error if ``solders`` is unavailable (never
    silently returns an incorrect result).
    """
    try:
        from solders.pubkey import Pubkey  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "solders is required for Solana-compatible ed25519 curve checks in "
            "circuit_sdk.pda. Install the SDK dependencies (e.g. "
            "`cd packages/sdk && uv sync` or `pip install solders==0.27.1`)."
        ) from exc

    try:
        return bool(Pubkey.from_bytes(pubkey_bytes).is_on_curve())
    except Exception as exc:
        # Invalid 32-byte input handling: Solana's check operates on 32 bytes;
        # propagate unexpected errors clearly.
        raise ValueError(f"Unable to check curve status for provided bytes: {exc}") from exc


def find_offer_address(maker: bytes, nonce: int, program_id: bytes) -> Tuple[bytes, int]:
    """Derive the offer PDA address and bump.

    Seeds: [OFFER_SEED, maker, nonce_le_u64]
    """
    return _find_program_address(
        [OFFER_SEED, maker, nonce.to_bytes(8, "little")],
        program_id,
    )


def find_escrow_authority_address(offer: bytes, program_id: bytes) -> Tuple[bytes, int]:
    """Derive the escrow authority PDA address and bump.

    Seeds: [ESCROW_SEED, offer_pubkey]
    """
    return _find_program_address([ESCROW_SEED, offer], program_id)
