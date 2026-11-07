import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { expect } from "chai";

import idl from "../../target/idl/circuit.json";
import { Circuit } from "../../target/types/circuit";

describe("circuit scaffold", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider() as anchor.AnchorProvider;
  // Construct the client from the generated IDL instead of `anchor.workspace`,
  // which resolves `Anchor.toml` relative to the current working directory.
  // This lets the suite run from either the repository root or `tests/`.
  const program = new Program<Circuit>(idl as unknown as Circuit, provider);

  const [config] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId,
  );

  before(async () => {
    // `solana-test-validator` starts with a faucet but does not fund an
    // arbitrary wallet. Fund the test wallet before the first transaction.
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    if (balance < anchor.web3.LAMPORTS_PER_SOL) {
      const signature = await provider.connection.requestAirdrop(
        provider.wallet.publicKey,
        anchor.web3.LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(signature, "confirmed");
    }
  });

  it("initialises the protocol configuration PDA", async () => {
    await program.methods
      .initialize()
      .accountsPartial({
        payer: provider.wallet.publicKey,
        config,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.protocolConfig.fetch(config);
    expect(account.version).to.equal(1);
    expect(account.bump).to.be.a("number");
  });

  it("rejects a second initialisation of the same config PDA", async () => {
    let failed = false;

    try {
      await program.methods
        .initialize()
        .accountsPartial({
          payer: provider.wallet.publicKey,
          config,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch {
      failed = true;
    }

    expect(failed, "the second initialize call should fail").to.equal(true);
  });
});
