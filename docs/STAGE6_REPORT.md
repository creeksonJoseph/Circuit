# CIRCUIT — Stage 6 Report: Python SDK

**Status:** Implemented and verified.  
**Branch:** stage-6-sdk.

## A. Implementation summary
Preserved existing PDA/decoding/amount helpers. Added instruction builders for all four program instructions using IDL discriminators and 22-account settle layout. No new dependencies.

## B. Files changed
- `packages/sdk/src/circuit_sdk/amounts.py`
- `packages/sdk/src/circuit_sdk/offer.py`
- `packages/sdk/src/circuit_sdk/instructions.py` (new)
- `packages/sdk/src/circuit_sdk/__init__.py`
- `packages/sdk/tests/test_instructions.py` (new)

## C. Instruction compatibility
- Discriminators taken from IDL.
- create_offer args: nonce u64, offered_amount u64, requested_amount u64, expires_at i64.
- cancel_offer/refund_expired: no args.
- settle_cycle: 22 accounts in IDL order; verified positions 1-22.

## D. Tests and verification
- pytest: 14 passed.
- uv build --wheel: success.
- import smoke: ok.

## E. Dependencies
None added.

## F. Known limitations
- No RPC fetchers (matcher owns discovery).
- No token-account creation.

## G. Remaining work
None blocking.

## H. Task-board recommendation
Recommend marking Stage 6 complete.
