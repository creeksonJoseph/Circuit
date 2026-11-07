import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

import idl from "../../target/idl/circuit.json";
import { Circuit } from "../../target/types/circuit";

function expectAnchorError(err: unknown, codeOrName: string): void {
  const e = err as { error?: { errorCode?: { code?: string; name?: string } }; message?: string };
  const code = e?.error?.errorCode?.code;
  const name = e?.error?.errorCode?.name;
  const msg = e?.message ?? String(err);
  expect(
    code === codeOrName || name === codeOrName || msg.includes(codeOrName),
    `expected error ${codeOrName}, got code=${code} name=${name} msg=${msg}`,
  ).to.equal(true);
}

describe("create_offer", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = new Program<Circuit>(idl as unknown as Circuit, provider);
  const maker = provider.wallet as anchor.Wallet;
  let makerPubkey: anchor.web3.PublicKey;

  let offeredMint: anchor.web3.PublicKey;
  let requestedMint: anchor.web3.PublicKey;
  let makerOfferedAta: anchor.web3.PublicKey;
  let nonce = BigInt(Date.now());

  const decimals = 6;
  const offeredAmount = new anchor.BN(1_000_000);
  const requestedAmount = new anchor.BN(2_000_000);
  const futureExpiry = () => new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

  function nextNonce(): anchor.BN {
    nonce += 1n;
    return new anchor.BN(nonce.toString());
  }

  function findOffer(n: anchor.BN): [anchor.web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("offer"), makerPubkey.toBuffer(), n.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
  }

  function findEscrowAuthority(offer: anchor.web3.PublicKey): [anchor.web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), offer.toBuffer()],
      program.programId,
    );
  }

  async function createOfferTx(
    n: anchor.BN,
    overrides?: Partial<{
      offeredAmount: anchor.BN;
      requestedAmount: anchor.BN;
      expiresAt: anchor.BN;
      offeredMint: anchor.web3.PublicKey;
      requestedMint: anchor.web3.PublicKey;
      makerOfferedAta: anchor.web3.PublicKey;
      escrowAuthority: anchor.web3.PublicKey;
      escrowAta: anchor.web3.PublicKey;
    }>,
  ) {
    const [offer] = findOffer(n);
    const [escrowAuthorityDerived] = findEscrowAuthority(offer);
    const oMint = overrides?.offeredMint ?? offeredMint;
    const escrowAuthority = overrides?.escrowAuthority ?? escrowAuthorityDerived;
    const escrowAta =
      overrides?.escrowAta ??
      getAssociatedTokenAddressSync(oMint, escrowAuthority, true, TOKEN_PROGRAM_ID);
    return program.methods
      .createOffer(
        n,
        overrides?.offeredAmount ?? offeredAmount,
        overrides?.requestedAmount ?? requestedAmount,
        overrides?.expiresAt ?? futureExpiry(),
      )
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint: oMint,
        requestedMint: overrides?.requestedMint ?? requestedMint,
        makerOfferedAta: overrides?.makerOfferedAta ?? makerOfferedAta,
        escrowAuthority,
        escrowAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker.payer])
      .rpc();
  }

  before(async () => {
    makerPubkey = maker.publicKey;
    const balance = await provider.connection.getBalance(makerPubkey);
    if (balance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
      const sig = await provider.connection.requestAirdrop(
        makerPubkey,
        2 * anchor.web3.LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(sig, "confirmed");
    }

    offeredMint = await createMint(
      provider.connection,
      maker.payer,
      makerPubkey,
      null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );
    requestedMint = await createMint(
      provider.connection,
      maker.payer,
      makerPubkey,
      null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );
    makerOfferedAta = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      makerPubkey,
      undefined,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    await mintTo(
      provider.connection,
      maker.payer,
      offeredMint,
      makerOfferedAta,
      makerPubkey,
      10_000_000n,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
  });

  it("happy path creates offer and escrows exact amount", async () => {
    const n = nextNonce();
    const [offer] = findOffer(n);
    const [escrowAuthority, escrowBump] = findEscrowAuthority(offer);
    const escrowAta = getAssociatedTokenAddressSync(
      offeredMint,
      escrowAuthority,
      true,
      TOKEN_PROGRAM_ID,
    );
    const makerBefore = (await getAccount(provider.connection, makerOfferedAta)).amount;
    const expiry = futureExpiry();

    await createOfferTx(n, { expiresAt: expiry });

    const acct = await program.account.offer.fetch(offer);
    expect(acct.version).to.equal(1);
    expect(acct.bump).to.be.a("number");
    expect(acct.escrowBump).to.equal(escrowBump);
    expect(Object.keys(acct.status)[0]).to.equal("open");
    expect(acct.maker.toBase58()).to.equal(makerPubkey.toBase58());
    expect(acct.nonce.toString()).to.equal(n.toString());
    expect(acct.offeredMint.toBase58()).to.equal(offeredMint.toBase58());
    expect(acct.requestedMint.toBase58()).to.equal(requestedMint.toBase58());
    expect(acct.offeredAmount.toString()).to.equal(offeredAmount.toString());
    expect(acct.requestedAmount.toString()).to.equal(requestedAmount.toString());
    expect(acct.expiresAt.toString()).to.equal(expiry.toString());

    const escrow = await getAccount(provider.connection, escrowAta);
    expect(escrow.amount.toString()).to.equal(offeredAmount.toString());
    expect(escrow.owner.toBase58()).to.equal(escrowAuthority.toBase58());
    expect(escrow.mint.toBase58()).to.equal(offeredMint.toBase58());
    const makerAfter = (await getAccount(provider.connection, makerOfferedAta)).amount;
    expect(makerBefore - makerAfter).to.equal(BigInt(offeredAmount.toString()));
  });

  it("fails with ZeroOfferedAmount", async () => {
    try {
      await createOfferTx(nextNonce(), { offeredAmount: new anchor.BN(0) });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ZeroOfferedAmount");
    }
  });

  it("fails with ZeroRequestedAmount", async () => {
    try {
      await createOfferTx(nextNonce(), { requestedAmount: new anchor.BN(0) });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ZeroRequestedAmount");
    }
  });

  it("fails with SameMint", async () => {
    try {
      await createOfferTx(nextNonce(), { requestedMint: offeredMint });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "SameMint");
    }
  });

  it("fails with PastExpiry", async () => {
    try {
      await createOfferTx(nextNonce(), {
        expiresAt: new anchor.BN(Math.floor(Date.now() / 1000) - 10),
      });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "PastExpiry");
    }
  });

  it("fails when maker_offered_ata has wrong mint (ConstraintTokenMint)", async () => {
    const wrongAta = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,
      requestedMint,
      makerPubkey,
      undefined,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    try {
      await createOfferTx(nextNonce(), { makerOfferedAta: wrongAta });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenMint");
    }
  });

  it("fails when maker_offered_ata has wrong authority (ConstraintTokenOwner)", async () => {
    const other = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      other.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
    const otherAta = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      other.publicKey,
      undefined,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    await mintTo(
      provider.connection,
      maker.payer,
      offeredMint,
      otherAta,
      makerPubkey,
      5_000_000n,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
    try {
      await createOfferTx(nextNonce(), { makerOfferedAta: otherAta });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenOwner");
    }
  });

  it("fails with InsufficientBalance", async () => {
    try {
      await createOfferTx(nextNonce(), { offeredAmount: new anchor.BN("999999999999") });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "InsufficientBalance");
    }
  });

  it("fails on duplicate nonce (account already in use)", async () => {
    const n = nextNonce();
    await createOfferTx(n);
    try {
      await createOfferTx(n);
      expect.fail("should have failed");
    } catch (err) {
      const msg = String((err as Error)?.message ?? err);
      expect(msg.length > 0).to.equal(true);
      expect(
        msg.includes("already in use") ||
          msg.includes("ConstraintSeeds") ||
          msg.includes("custom program error: 0x0"),
        `unexpected duplicate error: ${msg}`,
      ).to.equal(true);
    }
  });

  it("fails when wrong escrow authority PDA supplied (ConstraintSeeds)", async () => {
    try {
      await createOfferTx(nextNonce(), {
        escrowAuthority: anchor.web3.Keypair.generate().publicKey,
      });
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintSeeds");
    }
  });

  it("succeeds when correct canonical escrow ATA is pre-created (idempotent)", async () => {
    const n = nextNonce();
    const [offer] = findOffer(n);
    const [escrowAuthority] = findEscrowAuthority(offer);
    const escrowAta = getAssociatedTokenAddressSync(
      offeredMint,
      escrowAuthority,
      true,
      TOKEN_PROGRAM_ID,
    );
    await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      escrowAuthority,
      undefined,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
      true,
    );
    await createOfferTx(n, { escrowAta });
    const escrow = await getAccount(provider.connection, escrowAta);
    expect(escrow.amount.toString()).to.equal(offeredAmount.toString());
  });

  it("fails when noncanonical escrow token account supplied (actual constraint error)", async () => {
    const n = nextNonce();
    try {
      await createOfferTx(n, { escrowAta: makerOfferedAta });
      expect.fail("should have failed");
    } catch (err) {
      const e = err as { error?: { errorCode?: { code?: string } }; message?: string };
      const code = e?.error?.errorCode?.code ?? "";
      const msg = e?.message ?? String(err);
      expect(
        ["ConstraintAssociated", "ConstraintTokenOwner", "ConstraintSeeds"].includes(code) ||
          /ConstraintAssociated|ConstraintTokenOwner|ConstraintSeeds|associated/i.test(msg),
        `unexpected error: code=${code} msg=${msg}`,
      ).to.equal(true);
    }
  });
});
