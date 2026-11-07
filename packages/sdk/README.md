# circuit-sdk (Python)

Python SDK scaffold for CIRCUIT.

**Stage 1 status:** configuration-only scaffold. It does not yet send
transactions or implement offer, escrow, settlement, or matching logic.

This SDK is **Python**, not TypeScript, per the Stage 1 decision. Do not add a
parallel TypeScript SDK. The TypeScript packages are limited to the matcher,
frontend, and integration tests.

The SDK is managed with **uv**. Do not use `pip` or `python3 -m venv` directly.

## Setup

```bash
# Once, if uv is missing
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

cd packages/sdk
uv sync --locked
```

## Test

```bash
uv run pytest
```

## Build

```bash
uv build --wheel
ls -1 dist/
```

The wheel is written to `packages/sdk/dist/`.

## Lockfile

`uv.lock` is committed. After changing `pyproject.toml`, run `uv lock`, review
the diff, and re-run the tests and build.

## From the repository root

```bash
npm run test:sdk
npm run build:sdk
```

## Planned scope

Later stages will add:

- PDA derivation for offers and escrow authorities.
- Instruction builders for create, cancel, refund, and settle.
- Account decoding from the Anchor IDL.
- Integer base-unit amount helpers.

The IDL is generated into `src/circuit_sdk/idl/` by `anchor build`. Do not edit
generated IDL or generated TypeScript types by hand.
