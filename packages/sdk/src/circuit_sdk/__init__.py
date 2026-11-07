"""CIRCUIT Python SDK.

Stage 2 adds PDA derivation helpers for offers and escrow authority.
"""

from .client import CircuitSDK
from .constants import (
    CIRCUIT_PROGRAM_ID,
    DEFAULT_RPC_URL,
    ESCROW_SEED,
    OFFER_SEED,
    PROTOCOL_VERSION,
)
from .pda import find_escrow_authority_address, find_offer_address

__all__ = [
    "CIRCUIT_PROGRAM_ID",
    "DEFAULT_RPC_URL",
    "ESCROW_SEED",
    "OFFER_SEED",
    "PROTOCOL_VERSION",
    "CircuitSDK",
    "find_escrow_authority_address",
    "find_offer_address",
]

__version__ = "0.1.0"
