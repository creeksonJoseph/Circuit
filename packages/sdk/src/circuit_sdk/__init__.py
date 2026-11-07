"""CIRCUIT Python SDK.

Stage 1 scaffold only. The SDK exposes public configuration and a stable
client object. Offer instructions, escrow helpers, settlement builders, and
account decoding are intentionally not implemented yet.
"""

from .client import CircuitSDK
from .constants import CIRCUIT_PROGRAM_ID, DEFAULT_RPC_URL, PROTOCOL_VERSION

__all__ = [
    "CIRCUIT_PROGRAM_ID",
    "DEFAULT_RPC_URL",
    "PROTOCOL_VERSION",
    "CircuitSDK",
]

__version__ = "0.1.0"
