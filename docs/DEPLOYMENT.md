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

## Mainnet

**Mainnet is not deployed.** Do not point production traffic at mainnet until
the program is deployed, verified, and accepted against
[MAINNET_READINESS.md](MAINNET_READINESS.md).

### Preconditions

- Independent security audit complete and findings resolved.
- Audited/reproducible build artifact.
- Funded mainnet deploy wallet.
- Program keypair and upgrade authority decided (prefer a multisig or timelock).
- Program ID confirmed.
- Redundant mainnet RPC and operational monitoring ready.
- Legal/compliance and real-asset risk acceptance completed.

### Program ID decision

You have two options:

1. **Reuse `4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc`** only if you deploy
   with the existing `target/deploy/circuit-keypair.json` and the ID is unused
   on mainnet.
2. **Use a new mainnet program keypair.** This changes the program ID. You must
   then update `declare_id!`, `Anchor.toml`, the IDL/generated types, matcher
   constants, SDK constants, and tests before building.

Never commit the program keypair or wallet keypair. Both are gitignored.

### Configure

Add the confirmed mainnet ID to `Anchor.toml`:

```toml
[programs.mainnet]
circuit = "<MAINNET_PROGRAM_ID>"
```

### Build and deploy

```bash
export MAINNET_RPC_URL="https://<your-mainnet-rpc>"
export ANCHOR_WALLET="$HOME/.config/solana/mainnet-deploy.json"

anchor build --arch v3 --tools-version v1.57
anchor deploy --provider.cluster "$MAINNET_RPC_URL" \
  --provider.wallet "$ANCHOR_WALLET" \
  --program-name circuit
```

Then publish the IDL:

```bash
anchor idl init \
  -f target/idl/circuit.json \
  --provider.cluster "$MAINNET_RPC_URL" \
  --provider.wallet "$ANCHOR_WALLET"
```

If the IDL already exists, use `anchor idl upgrade` instead.

For a guarded wrapper, use `scripts/deploy-mainnet.sh`. It refuses to run
without `CONFIRM_MAINNET_DEPLOY=YES` and rejects non-HTTPS or obvious
devnet/local URLs.

### After deployment

- Verify the deployed bytecode against the audited artifact.
- Confirm the upgrade authority is the intended multisig/timelock.
- Run a real three-party settlement with small amounts.
- Verify events, escrow closure, and bad-transaction rejection on mainnet.
- Keep the devnet deployment available for regression testing.

## Configuration

`Anchor.toml` defines the same program ID for localnet and Devnet. Applications
should select the RPC endpoint explicitly and use a dedicated test wallet.
Never commit wallet keypairs or seed phrases.

For local development, follow [Getting Started](GETTING_STARTED.md). For
program/account failures, see [Troubleshooting](TROUBLESHOOTING.md).

---

[Documentation index](README.md) · [Getting Started](GETTING_STARTED.md) ·
[Security](SECURITY.md)
