from circuit_sdk import (
    CIRCUIT_PROGRAM_ID,
    DEFAULT_RPC_URL,
    PROTOCOL_VERSION,
    CircuitSDK,
)


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
