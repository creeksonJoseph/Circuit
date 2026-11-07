import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAccount,
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

function expectAnyError(err: unknown, needles: string[]): void {
  const e = err as { error?: { errorCode?: { code?: string; name?: string } }; message?: string };
  const code = e?.error?.errorCode?.code ?? "";
  const name = e?.error?.errorCode?.name ?? "";
  const msg = e?.message ?? String(err);
  const hay = `${code} ${name} ${msg}`;
  expect(
    needles.some((n) => hay.includes(n)),
    `expected one of ${needles.join(", ")}, got ${hay}`,
  ).to.equal(true);
}

async function pollUntilExpired(
  provider: anchor.AnchorProvider,
  expiresAt: number,
  maxMs = 5000,
  intervalMs = 200,
): Promise<void> {
  // Local validator harness limitation: no deterministic RPC clock warp here.
  // Bounded polling observes block time reaching/passing expiresAt; it does not
  // prove execution at exactly Clock == expires_at.
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const slot = await provider.connection.getSlot("confirmed");
    const t = await provider.connection.getBlockTime(slot);
    if (t !== null && t >= expiresAt) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`validator clock did not reach expires_at=${expiresAt} within ${maxMs}ms`);
}

async function getTxWithRetry(
  provider: anchor.AnchorProvider,
  sig: string,
  attempts = 24,
  delayMs = 250,
): Promise<anchor.web3.ParsedTransactionWithMeta | null> {
  for (let i = 0; i < attempts; i++) {
    const tx = await provider.connection.getParsedTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (tx) return tx;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

describe("cancel_offer", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = new Program<Circuit>(idl as unknown as Circuit, provider);
  const maker = provider.wallet as anchor.Wallet;
  let makerPubkey: anchor.web3.PublicKey;

  let offeredMint: anchor.web3.PublicKey;
  let requestedMint: anchor.web3.PublicKey;
  let makerOfferedAta: anchor.web3.PublicKey;
  let nonce = BigInt(Date.now() * 1000);

  const decimals = 6;
  const offeredAmount = new anchor.BN(1_000_000);
  const requestedAmount = new anchor.BN(2_000_000);

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

  async function createOffer(
    n: anchor.BN,
    opts?: { expiresAt?: anchor.BN; makerAta?: anchor.web3.PublicKey },
  ) {
    const [offer] = findOffer(n);
    const [escrowAuthority] = findEscrowAuthority(offer);
    const escrowAta = getAssociatedTokenAddressSync(
      offeredMint,
      escrowAuthority,
      true,
      TOKEN_PROGRAM_ID,
    );
    const slot = await provider.connection.getSlot("confirmed");
    const blockTime =
      (await provider.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
    const expiresAt = opts?.expiresAt ?? new anchor.BN(blockTime + 3600);
    await program.methods
      .createOffer(n, offeredAmount, requestedAmount, expiresAt)
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        requestedMint,
        makerOfferedAta: opts?.makerAta ?? makerOfferedAta,
        escrowAuthority,
        escrowAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker.payer])
      .rpc();
    return { offer, escrowAuthority, escrowAta, expiresAt };
  }

  async function expectAccountClosed(pubkey: anchor.web3.PublicKey): Promise<void> {
    const info = await provider.connection.getAccountInfo(pubkey);
    expect(info, `expected ${pubkey.toBase58()} to be closed`).to.equal(null);
  }

  before(async () => {
    makerPubkey = maker.publicKey;
    const balance = await provider.connection.getBalance(makerPubkey);
    if (balance < 4 * anchor.web3.LAMPORTS_PER_SOL) {
      const sig = await provider.connection.requestAirdrop(
        makerPubkey,
        4 * anchor.web3.LAMPORTS_PER_SOL,
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
      50_000_000n,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
  });

  it("happy path: cancels, refunds full balance to non-canonical maker dest, closes escrow, rent to maker, sets Cancelled, emits event fields", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    const makerNonCanonicalDest = await createAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      makerPubkey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const makerDestBefore = (await getAccount(provider.connection, makerNonCanonicalDest)).amount;
    const makerLamportsBefore = await provider.connection.getBalance(makerPubkey);
    const escrowLamports = (await provider.connection.getAccountInfo(escrowAta))!.lamports;
    const escrowAmount = (await getAccount(provider.connection, escrowAta)).amount;

    const sig = await program.methods
      .cancelOffer()
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerNonCanonicalDest,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([maker.payer])
      .rpc();

    const tx = await getTxWithRetry(provider, sig);
    expect(tx, "cancel tx should be fetchable").to.not.equal(null);

    const makerDestAfter = (await getAccount(provider.connection, makerNonCanonicalDest)).amount;
    expect(makerDestAfter - makerDestBefore).to.equal(escrowAmount);
    expect(escrowAmount.toString()).to.equal(offeredAmount.toString());
    await expectAccountClosed(escrowAta);

    const makerLamportsAfter = await provider.connection.getBalance(makerPubkey);
    // Maker pays tx fee and receives closed escrow ATA rent.
    expect(makerLamportsAfter).to.be.greaterThan(makerLamportsBefore - 50_000 + escrowLamports - 1);

    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("cancelled");

    const evParser = new anchor.EventParser(program.programId, program.coder);
    const events = [...evParser.parseLogs(tx!.meta!.logMessages ?? [])];
    const ev = events.find((e) => e.name === "offerCancelled");
    expect(ev, "OfferCancelled event should be emitted").to.not.equal(undefined);
    expect((ev!.data as { offer: anchor.web3.PublicKey }).offer.toBase58()).to.equal(
      offer.toBase58(),
    );
    expect((ev!.data as { maker: anchor.web3.PublicKey }).maker.toBase58()).to.equal(
      makerPubkey.toBase58(),
    );
    expect((ev!.data as { refundedAmount: anchor.BN }).refundedAmount.toString()).to.equal(
      offeredAmount.toString(),
    );
  });

  it("allows cancel after expiry if still Open", async () => {
    const n = nextNonce();
    const slot = await provider.connection.getSlot("confirmed");
    const blockTime =
      (await provider.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
    const expiresAt = blockTime + 2;
    const { offer, escrowAuthority, escrowAta } = await createOffer(n, {
      expiresAt: new anchor.BN(expiresAt),
    });
    await pollUntilExpired(provider, expiresAt);

    await program.methods
      .cancelOffer()
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerOfferedAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([maker.payer])
      .rpc();

    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("cancelled");
  });

  it("returns entire balance including unsolicited same-mint deposit", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    await mintTo(
      provider.connection,
      maker.payer,
      offeredMint,
      escrowAta,
      makerPubkey,
      123n,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const makerDest = await createAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      makerPubkey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const before = (await getAccount(provider.connection, makerDest)).amount;
    await program.methods
      .cancelOffer()
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerDest,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([maker.payer])
      .rpc();
    const after = (await getAccount(provider.connection, makerDest)).amount;
    expect(after - before).to.equal(BigInt(offeredAmount.toString()) + 123n);
  });

  it("rejects non-maker with NotMaker", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    const intruder = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      intruder.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: intruder.publicKey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([intruder])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "NotMaker");
    }
  });

  it("rejects non-Open with OfferNotOpen (second cancel)", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    await program.methods
      .cancelOffer()
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerOfferedAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([maker.payer])
      .rpc();
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnyError(err, ["OfferNotOpen", "AccountNotInitialized", "AccountOwnedByWrongProgram"]);
    }
  });

  it("rejects wrong destination mint", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    const wrongMintDest = await createAccount(
      provider.connection,
      maker.payer,
      requestedMint,
      makerPubkey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: wrongMintDest,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenMint");
    }
  });

  it("rejects wrong destination authority", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    const other = anchor.web3.Keypair.generate();
    const airdrop = await provider.connection.requestAirdrop(
      other.publicKey,
      anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdrop, "confirmed");
    const otherDest = await createAccount(
      provider.connection,
      other,
      offeredMint,
      other.publicKey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: otherDest,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenOwner");
    }
  });

  it("rejects invalid escrow authority PDA (ConstraintSeeds)", async () => {
    const n = nextNonce();
    const { offer, escrowAta } = await createOffer(n);
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority: anchor.web3.Keypair.generate().publicKey,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintSeeds");
    }
  });

  it("rejects invalid escrow ATA", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority } = await createOffer(n);
    const makerDest = await createAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      makerPubkey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta: makerOfferedAta,
          makerTokenAccount: makerDest,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnyError(err, [
        "ConstraintAssociated",
        "ConstraintTokenOwner",
        "ConstraintSeeds",
        "ConstraintDuplicateMutableAccount",
      ]);
    }
  });

  it("rejects invalid offer PDA (ConstraintSeeds)", async () => {
    const n = nextNonce();
    const real = await createOffer(n);
    const n2 = nextNonce();
    const fake = await createOffer(n2);
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer: fake.offer,
          offeredMint,
          escrowAuthority: real.escrowAuthority,
          escrowAta: real.escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnyError(err, ["ConstraintSeeds", "ConstraintAssociated", "AccountNotInitialized"]);
    }
  });

  it("SPL invariant check: transfer_checked amount 0 succeeds and zero-balance token account can be closed (Circuit zero-balance path not protocol-reachable)", async () => {
    // Investigation support: Stage 3 handlers do transfer_checked(escrow_ata.amount) then close.
    // This test verifies the underlying original SPL Token behavior only.
    const owner = anchor.web3.Keypair.generate();
    const airdrop = await provider.connection.requestAirdrop(
      owner.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdrop, "confirmed");
    const source = await createAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      owner.publicKey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const dest = await createAccount(
      provider.connection,
      maker.payer,
      offeredMint,
      owner.publicKey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const { transferChecked, closeAccount } = await import("@solana/spl-token");
    await transferChecked(
      provider.connection,
      owner,
      source,
      offeredMint,
      dest,
      owner.publicKey,
      0n,
      decimals,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
    const beforeClose = await provider.connection.getBalance(owner.publicKey);
    await closeAccount(
      provider.connection,
      owner,
      source,
      owner.publicKey,
      owner.publicKey,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await expectAccountClosed(source);
    const afterClose = await provider.connection.getBalance(owner.publicKey);
    expect(afterClose).to.be.greaterThan(beforeClose - 50_000);
  });
  it("failure leaves offer Open and escrow intact", async () => {
    const n = nextNonce();
    const { offer, escrowAuthority, escrowAta } = await createOffer(n);
    try {
      await program.methods
        .cancelOffer()
        .accountsStrict({
          maker: makerPubkey,
          offer,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: await createAccount(
            provider.connection,
            maker.payer,
            requestedMint,
            makerPubkey,
            anchor.web3.Keypair.generate(),
            undefined,
            TOKEN_PROGRAM_ID,
          ),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([maker.payer])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenMint");
    }
    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("open");
    const escrow = await getAccount(provider.connection, escrowAta);
    expect(escrow.amount.toString()).to.equal(offeredAmount.toString());
  });
});
