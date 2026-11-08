"""Amount and integer safety helpers for CIRCUIT."""

from __future__ import annotations

U64_MAX = (1 << 64) - 1
I64_MIN = -(1 << 63)
I64_MAX = (1 << 63) - 1


def to_u64(value: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("amount must be an int")
    if value < 0 or value > U64_MAX:
        raise ValueError(f"amount out of u64 range: {value}")
    return value


def to_i64(value: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("timestamp must be an int")
    if value < I64_MIN or value > I64_MAX:
        raise ValueError(f"timestamp out of i64 range: {value}")
    return value
