# Deployment

## Devnet

CIRCUIT is deployed on Solana Devnet:

- Program ID: `4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc`
- Deployment slot: `520027834`
- Deployment transaction:
  `39qHLv9q2bZC5mdRAo41HB2QVne71LfFVujW3371Da1D7yjY6g14sPRr1LzDrsX5beJaceLUayW7rWKDzpr3jpNK`

The executable program account was verified with `solana program show`.
The ID matches the Rust declaration, Anchor configuration, generated IDL, and
SDK constants.

This verifies deployment, not a complete Devnet three-party settlement.

## Configuration

`Anchor.toml` defines the same program ID for localnet and Devnet. Applications
should select the RPC endpoint explicitly and use a dedicated test wallet.
Never commit wallet keypairs or seed phrases.

For local development, follow [Getting Started](GETTING_STARTED.md). For
program/account failures, see [Troubleshooting](TROUBLESHOOTING.md).

---

[Documentation index](README.md) · [Getting Started](GETTING_STARTED.md) ·
[Security](SECURITY.md)
