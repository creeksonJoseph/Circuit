"""Public constants for the CIRCUIT Python SDK."""

#: Default local validator RPC endpoint.
DEFAULT_RPC_URL = "http://127.0.0.1:8899"

#: Program ID used by localnet and devnet for the Stage 1 scaffold.
CIRCUIT_PROGRAM_ID = "4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc"

#: Must match ``PROTOCOL_VERSION`` in the on-chain program.
PROTOCOL_VERSION = 1

#: PDA seed for the protocol configuration account.
CONFIG_SEED = b"config"
