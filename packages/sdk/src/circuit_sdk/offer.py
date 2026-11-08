"""Offer account representation and decoding for CIRCUIT."""

from __future__ import annotations

import struct
from dataclasses import dataclass
from enum import IntEnum


class OfferStatus(IntEnum):
    OPEN = 0
    SETTLED = 1
    CANCELLED = 2
    EXPIRED = 3


@dataclass(frozen=True)
class Offer:
    version: int
    bump: int
    escrow_bump: int
    status: OfferStatus
    maker: bytes
    nonce: int
    offered_mint: bytes
    requested_mint: bytes
    offered_amount: int
    requested_amount: int
    created_at: int
    expires_at: int

    @classmethod
    def from_bytes(cls, data: bytes) -> "Offer":
        if len(data) < 8:
            raise ValueError("offer account data too short")
        body = data[8:]
        expected = 1 + 1 + 1 + 1 + 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8
        if len(body) < expected:
            raise ValueError("offer account data too short")
        version, bump, escrow_bump, status = struct.unpack("<BBBB", body[:4])
        off = 4
        maker = body[off : off + 32]; off += 32
        nonce = struct.unpack_from("<Q", body, off)[0]; off += 8
        offered_mint = body[off : off + 32]; off += 32
        requested_mint = body[off : off + 32]; off += 32
        offered_amount = struct.unpack_from("<Q", body, off)[0]; off += 8
        requested_amount = struct.unpack_from("<Q", body, off)[0]; off += 8
        created_at = struct.unpack_from("<q", body, off)[0]; off += 8
        expires_at = struct.unpack_from("<q", body, off)[0]; off += 8
        try:
            st = OfferStatus(status)
        except ValueError as exc:
            raise ValueError(f"unknown offer status: {status}") from exc
        return cls(
            version=version,
            bump=bump,
            escrow_bump=escrow_bump,
            status=st,
            maker=maker,
            nonce=nonce,
            offered_mint=offered_mint,
            requested_mint=requested_mint,
            offered_amount=offered_amount,
            requested_amount=requested_amount,
            created_at=created_at,
            expires_at=expires_at,
        )
