# CIRCUIT Python SDK

The Python SDK provides PDA helpers, integer amount validation, offer decoding,
and instruction builders for the CIRCUIT Anchor program. It is managed with
`uv`; do not use `pip` or a directly-created virtual environment.

Start with the [Python SDK guide](../../docs/PYTHON_SDK.md), then see the
[protocol account model](../../docs/PROTOCOL.md).

```bash
cd packages/sdk
uv sync --locked
uv run pytest
uv build --wheel
```

The SDK does not hold keys or submit transactions for callers. Applications
must sign and send the returned instructions with their own wallet.
