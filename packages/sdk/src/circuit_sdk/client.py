"""Client scaffold for the CIRCUIT Python SDK."""

from dataclasses import dataclass

from .constants import CIRCUIT_PROGRAM_ID, DEFAULT_RPC_URL, PROTOCOL_VERSION


@dataclass(frozen=True)
class CircuitSDK:
    """Public configuration for talking to a CIRCUIT deployment.

    Stage 1 does not send transactions. Network access and instruction
    builders are added in the SDK stage after the on-chain program exists.
    """

    rpc_url: str = DEFAULT_RPC_URL
    program_id: str = CIRCUIT_PROGRAM_ID
    protocol_version: int = PROTOCOL_VERSION

    def describe(self) -> dict[str, str | int]:
        """Return the public, non-secret configuration as a plain mapping."""

        return {
            "rpc_url": self.rpc_url,
            "program_id": self.program_id,
            "protocol_version": self.protocol_version,
        }
