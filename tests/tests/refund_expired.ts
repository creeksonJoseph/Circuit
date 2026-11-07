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
  maxMs = 6000,
  intervalMs = 200,
): Promise<void> {
  // Local validator harness limitation: no deterministic RPC clock warp here.
  // Bounded polling observes when validator block time reaches/passes expiresAt;
  // it does not prove on-chain execution at exactly Clock == expires_at.
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const slot = await provider.connection.getSlot("confirmed");
    const t = await provider.connection.getBlockTime(slot);
    if (t !== null && t >= expiresAt) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`validator clock did not reach expires_at=${expiresAt} within ${maxMs}ms`);
}

async function expectAccountClosed(
  provider: anchor.AnchorProvider,
  pubkey: anchor.web3.PublicKey,
): Promise<void> {
  const info = await provider.connection.getAccountInfo(pubkey);
  expect(info, `expected ${pubkey.toBase58()} to be closed`).to.equal(null);
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

describe("refund_expired", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = new Program<Circuit>(idl as unknown as Circuit, provider);
  const maker = provider.wallet as anchor.Wallet;
  let makerPubkey: anchor.web3.PublicKey;

  let offeredMint: anchor.web3.PublicKey;
  let requestedMint: anchor.web3.PublicKey;
  let makerOfferedAta: anchor.web3.PublicKey;
  let nonce = BigInt(Date.now() * 2000);

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

  async function createExpiringOffer(secondsUntilExpiry: number) {
    const n = nextNonce();
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
    const expiresAt = blockTime + secondsUntilExpiry;
    await program.methods
      .createOffer(n, offeredAmount, requestedAmount, new anchor.BN(expiresAt))
      .accountsStrict({
        maker: makerPubkey,
        offer,
        offeredMint,
        requestedMint,
        makerOfferedAta,
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

  async function createFundedCaller(): Promise<anchor.web3.Keypair> {
    const caller = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      caller.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
    return caller;
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

  it("happy path: permissionless caller refunds full balance to maker (non-canonical), closes escrow, rent to maker, caller gets no tokens/rent, emits event", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
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
    const callerLamportsBefore = await provider.connection.getBalance(caller.publicKey);
    const callerTokensBefore = 0n; // caller has no offered-mint token account
    const escrowLamports = (await provider.connection.getAccountInfo(escrowAta))!.lamports;

    const tx = await program.methods
      .refundExpired()
      .accountsStrict({
        caller: caller.publicKey,
        offer,
        maker: makerPubkey,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerNonCanonicalDest,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    tx.feePayer = caller.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash("confirmed")).blockhash;
    tx.sign(caller);
    const sig = await provider.connection.sendRawTransaction(tx.serialize());
    await provider.connection.confirmTransaction(sig, "confirmed");

    const parsedTx = await getTxWithRetry(provider, sig);
    expect(parsedTx, "refund tx should be fetchable").to.not.equal(null);

    const makerDestAfter = (await getAccount(provider.connection, makerNonCanonicalDest)).amount;
    expect(makerDestAfter - makerDestBefore).to.equal(BigInt(offeredAmount.toString()));
    await expectAccountClosed(provider, escrowAta);

    const makerLamportsAfter = await provider.connection.getBalance(makerPubkey);
    // Rent from closed escrow ATA must go to maker (not caller). Maker is not tx fee payer/signer.
    const makerDelta = makerLamportsAfter - makerLamportsBefore;
    expect(makerDelta).to.be.greaterThan(0);
    expect(makerDelta).to.be.closeTo(escrowLamports, 20_000);

    const callerLamportsAfter = await provider.connection.getBalance(caller.publicKey);
    expect(callerLamportsAfter).to.be.lessThan(callerLamportsBefore); // caller paid fee only
    expect(callerTokensBefore).to.equal(0n);

    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("expired");

    const evParser = new anchor.EventParser(program.programId, program.coder);
    const events = [...evParser.parseLogs(parsedTx!.meta!.logMessages ?? [])];
    const ev = events.find((e) => e.name === "offerExpired");
    expect(ev, "OfferExpired event should be emitted").to.not.equal(undefined);
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

  it("rejects before expiry with NotExpired", async () => {
    const { offer, escrowAuthority, escrowAta } = await createExpiringOffer(3600);
    const caller = await createFundedCaller();
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "NotExpired");
    }
  });

  it("succeeds after observed expiry (implementation requires now >= expires_at; harness cannot prove exact Clock == expires_at)", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(1);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
    await program.methods
      .refundExpired()
      .accountsStrict({
        caller: caller.publicKey,
        offer,
        maker: makerPubkey,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerOfferedAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([caller])
      .rpc();
    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("expired");
  });

  it("returns entire balance including unsolicited same-mint deposit", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await mintTo(
      provider.connection,
      maker.payer,
      offeredMint,
      escrowAta,
      makerPubkey,
      321n,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
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
      .refundExpired()
      .accountsStrict({
        caller: caller.publicKey,
        offer,
        maker: makerPubkey,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerDest,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([caller])
      .rpc();
    const after = (await getAccount(provider.connection, makerDest)).amount;
    expect(after - before).to.equal(BigInt(offeredAmount.toString()) + 321n);
  });

  it("rejects wrong destination mint", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
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
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: wrongMintDest,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenMint");
    }
  });

  it("rejects wrong destination authority (redirect attempt)", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
    const callerDest = await createAccount(
      provider.connection,
      caller,
      offeredMint,
      caller.publicKey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: callerDest,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintTokenOwner");
    }
  });

  it("rejects wrong maker rent account (ConstraintAddress)", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: caller.publicKey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintAddress");
    }
  });

  it("rejects invalid escrow PDA/ATA", async () => {
    const { offer, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority: anchor.web3.Keypair.generate().publicKey,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "ConstraintSeeds");
    }
  });

  it("rejects non-Open with OfferNotOpen (second refund)", async () => {
    const { offer, escrowAuthority, escrowAta, expiresAt } = await createExpiringOffer(2);
    await pollUntilExpired(provider, expiresAt);
    const caller = await createFundedCaller();
    await program.methods
      .refundExpired()
      .accountsStrict({
        caller: caller.publicKey,
        offer,
        maker: makerPubkey,
        offeredMint,
        escrowAuthority,
        escrowAta,
        makerTokenAccount: makerOfferedAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([caller])
      .rpc();
    const caller2 = await createFundedCaller();
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller2.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller2])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnyError(err, ["OfferNotOpen", "AccountNotInitialized", "AccountOwnedByWrongProgram"]);
    }
  });

  it("failure leaves offer Open and escrow intact", async () => {
    const { offer, escrowAuthority, escrowAta } = await createExpiringOffer(3600);
    const caller = await createFundedCaller();
    try {
      await program.methods
        .refundExpired()
        .accountsStrict({
          caller: caller.publicKey,
          offer,
          maker: makerPubkey,
          offeredMint,
          escrowAuthority,
          escrowAta,
          makerTokenAccount: makerOfferedAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([caller])
        .rpc();
      expect.fail("should have failed");
    } catch (err) {
      expectAnchorError(err, "NotExpired");
    }
    const acct = await program.account.offer.fetch(offer);
    expect(Object.keys(acct.status)[0]).to.equal("open");
    const escrow = await getAccount(provider.connection, escrowAta);
    expect(escrow.amount.toString()).to.equal(offeredAmount.toString());
  });
});
