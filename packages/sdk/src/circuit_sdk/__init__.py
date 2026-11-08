"""CIRCUIT Python SDK.

Stage 2 adds PDA derivation helpers for offers and escrow authority.
"""

from .amounts import to_i64, to_u64
from .client import CircuitSDK
from .constants import (
    CIRCUIT_PROGRAM_ID,
    DEFAULT_RPC_URL,
    ESCROW_SEED,
    OFFER_SEED,
    PROTOCOL_VERSION,
)
from .instructions import (
    build_cancel_offer,
    build_create_offer,
    build_refund_expired,
    build_settle_cycle,
)
from .offer import Offer, OfferStatus
from .pda import find_escrow_authority_address, find_offer_address

__all__ = [
    "CIRCUIT_PROGRAM_ID",
    "DEFAULT_RPC_URL",
    "ESCROW_SEED",
    "OFFER_SEED",
    "PROTOCOL_VERSION",
    "CircuitSDK",
    "Offer",
    "OfferStatus",
    "build_cancel_offer",
    "build_create_offer",
    "build_refund_expired",
    "build_settle_cycle",
    "find_escrow_authority_address",
    "find_offer_address",
    "to_i64",
    "to_u64",
]

__version__ = "0.1.0"
