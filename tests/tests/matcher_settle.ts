import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

import idl from "../../target/idl/circuit.json";
import { Circuit } from "../../target/types/circuit";
import {
  buildSettleCycleAccountMap,
  discoverOffers,
  findCycleCandidates,
  recheckCandidateState,
  resolveCandidateAccounts,
  type OfferSnapshot,
} from "../../packages/matcher/src/index";

function expectAnyError(err: unknown, needles: string[]): void {
  const e = err as { error?: { errorCode?: { code?: string; name?: string } }; message?: string };
  const hay = `${e?.error?.errorCode?.code ?? ""} ${e?.error?.errorCode?.name ?? ""} ${e?.message ?? String(err)}`;
  expect(
    needles.some((n) => hay.includes(n)),
    `expected one of ${needles.join(", ")}, got ${hay}`,
  ).to.equal(true);
}

describe("matcher_settle (Stage 5 integration)", () => {
  // The matcher discovers, resolves, and rechecks at `confirmed`. Anchor's
  // default provider commitment is `processed`, so writes would be visible to
  // the test before they are visible to the matcher's confirmed reads. Build a
  // provider (and connection) that confirms at the same commitment the matcher
  // uses to avoid a processed/confirmed visibility race in fixture setup.
  const envProvider = anchor.AnchorProvider.env();
  anchor.setProvider(
    new anchor.AnchorProvider(
      new anchor.web3.Connection(envProvider.connection.rpcEndpoint, "confirmed"),
      envProvider.wallet,
      { commitment: "confirmed", preflightCommitment: "confirmed" },
    ),
  );
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = new Program<Circuit>(idl as unknown as Circuit, provider);
  const decimals = 6;
  let nonceSeed = BigInt(Date.now() * 9000);

  function nextNonce(): anchor.BN {
    nonceSeed += 1n;
    return new anchor.BN(nonceSeed.toString());
  }
  async function fund(kp: anchor.web3.PublicKey, sol = 3): Promise<void> {
    const sig = await provider.connection.requestAirdrop(kp, sol * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");
  }
  function findOffer(maker: anchor.web3.PublicKey, n: anchor.BN): [anchor.web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("offer"), maker.toBuffer(), n.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
  }
  function findEscrowAuthority(offer: anchor.web3.PublicKey): [anchor.web3.PublicKey, number] {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), offer.toBuffer()],
      program.programId,
    );
  }
  async function makeMint(): Promise<anchor.web3.PublicKey> {
    return createMint(
      provider.connection,
      provider.wallet.payer!,
      provider.wallet.publicKey!,
      null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );
  }

  it("matcher-produced plan settles successfully via existing settle_cycle", async () => {
    const mA = anchor.web3.Keypair.generate();
    const mB = anchor.web3.Keypair.generate();
    const mC = anchor.web3.Keypair.generate();
    await Promise.all([fund(mA.publicKey), fund(mB.publicKey), fund(mC.publicKey)]);
    const mX = await makeMint();
    const mY = await makeMint();
    const mZ = await makeMint();
    const amt = 1_000_000n;
    const offeredAmount = new anchor.BN(amt.toString());
    const requestedAmount = new anchor.BN(amt.toString());
    const slot = await provider.connection.getSlot("confirmed");
    const blockTime =
      (await provider.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
    const expiresAt = blockTime + 3600;
    const exp = new anchor.BN(expiresAt);

    async function createOne(
      maker: anchor.web3.Keypair,
      offeredMint: anchor.web3.PublicKey,
      requestedMint: anchor.web3.PublicKey,
    ) {
      const { address: ata } = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer!,
        offeredMint,
        maker.publicKey,
        false,
        "confirmed",
        undefined,
        TOKEN_PROGRAM_ID,
      );
      await mintTo(
        provider.connection,
        provider.wallet.payer!,
        offeredMint,
        ata,
        provider.wallet.publicKey,
        50_000_000n,
        [],
        undefined,
        TOKEN_PROGRAM_ID,
      );
      const n = nextNonce();
      const [offer] = findOffer(maker.publicKey, n);
      const [ea] = findEscrowAuthority(offer);
      const esc = getAssociatedTokenAddressSync(offeredMint, ea, true, TOKEN_PROGRAM_ID);
      await program.methods
        .createOffer(n, offeredAmount, requestedAmount, exp)
        .accountsStrict({
          maker: maker.publicKey,
          offer,
          offeredMint,
          requestedMint,
          makerOfferedAta: ata,
          escrowAuthority: ea,
          escrowAta: esc,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([maker])
        .rpc();
      return { maker, offer, ea, esc, offeredMint, requestedMint, nonce: BigInt(n.toString()) };
    }

    const a = await createOne(mA, mX, mY);
    const b = await createOne(mB, mY, mZ);
    const c = await createOne(mC, mZ, mX);

    const expectedOffers = new Set([a.offer.toBase58(), b.offer.toBase58(), c.offer.toBase58()]);
    const discovery = await discoverOffers(provider.connection, { commitment: "confirmed" });
    const discovered = discovery.offers.filter((entry) =>
      expectedOffers.has(entry.snapshot.offer.toBase58()),
    );
    expect(discovered.map((entry) => entry.snapshot.offer.toBase58())).to.have.members([
      a.offer.toBase58(),
      b.offer.toBase58(),
      c.offer.toBase58(),
    ]);
    const match = findCycleCandidates(
      discovered.map((entry) => entry.snapshot),
      {
        nowUnixSeconds: BigInt(blockTime),
        expirySafetyBufferSeconds: 0n,
      },
    );
    expect(match.candidates.length).to.be.greaterThan(0);
    const cand = match.candidates[0]!;
    expect(cand.validity.tier1).to.equal("mathematically_valid");

    // Ensure dest ATAs exist using the canonical A/B/C assignment from the matcher.
    // getOrCreateAssociatedTokenAccount handles the case where the ATA already exists.
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.x),
      new anchor.web3.PublicKey(cand.makers.c),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.y),
      new anchor.web3.PublicKey(cand.makers.a),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.z),
      new anchor.web3.PublicKey(cand.makers.b),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );

    await resolveCandidateAccounts(provider.connection, cand, "confirmed");
    expect(
      cand.validity.accountsResolved,
      `resolutions: ${JSON.stringify(cand.accountResolutions)}`,
    ).to.equal(true);

    await recheckCandidateState({
      connection: provider.connection,
      candidate: cand,
      nowUnixSeconds: BigInt(blockTime),
      commitment: "confirmed",
    });
    expect(
      cand.validity.rechecked,
      `recheck checks: ${cand.validity.rechecked?.checks.join(",")}`,
    ).to.not.equal(undefined);
    expect(
      cand.validity.rechecked?.ok,
      `recheck checks: ${cand.validity.rechecked?.checks.join(",")}`,
    ).to.equal(true);

    const destinationBefore = await Promise.all([
      getAccount(
        provider.connection,
        new anchor.web3.PublicKey(cand.settlementAccounts.destCReceivesX!),
      ),
      getAccount(
        provider.connection,
        new anchor.web3.PublicKey(cand.settlementAccounts.destAReceivesY!),
      ),
      getAccount(
        provider.connection,
        new anchor.web3.PublicKey(cand.settlementAccounts.destBReceivesZ!),
      ),
    ]);
    const p = buildSettleCycleAccountMap(cand.settlementAccounts, cand.accountResolutions);
    await program.methods.settleCycle().accountsStrict(p).rpc();

    const destinationAfter = await Promise.all([
      getAccount(provider.connection, p.destCReceivesX),
      getAccount(provider.connection, p.destAReceivesY),
      getAccount(provider.connection, p.destBReceivesZ),
    ]);
    destinationAfter.forEach((account, index) => {
      expect(account.amount - destinationBefore[index]!.amount).to.equal(amt);
    });
    for (const escrow of [p.escrowAtaA, p.escrowAtaB, p.escrowAtaC]) {
      expect(await provider.connection.getAccountInfo(escrow)).to.equal(null);
    }
    for (const offer of [p.offerA, p.offerB, p.offerC]) {
      const account = await program.account.offer.fetch(offer);
      expect(account.status).to.deep.equal({ settled: {} });
    }
  });

  it("stale candidate: state changes after discovery -> matcher recheck reports issue and on-chain rejects", async () => {
    const mA = anchor.web3.Keypair.generate();
    const mB = anchor.web3.Keypair.generate();
    const mC = anchor.web3.Keypair.generate();
    await Promise.all([fund(mA.publicKey), fund(mB.publicKey), fund(mC.publicKey)]);
    const mX = await makeMint();
    const mY = await makeMint();
    const mZ = await makeMint();
    const amt = 1_000_000n;
    const offeredAmount = new anchor.BN(amt.toString());
    const requestedAmount = new anchor.BN(amt.toString());
    const slot = await provider.connection.getSlot("confirmed");
    const blockTime =
      (await provider.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
    const expiresAt = blockTime + 3600;
    const exp = new anchor.BN(expiresAt);

    async function createOne(
      maker: anchor.web3.Keypair,
      offeredMint: anchor.web3.PublicKey,
      requestedMint: anchor.web3.PublicKey,
    ) {
      const { address: ata } = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer!,
        offeredMint,
        maker.publicKey,
        false,
        "confirmed",
        undefined,
        TOKEN_PROGRAM_ID,
      );
      await mintTo(
        provider.connection,
        provider.wallet.payer!,
        offeredMint,
        ata,
        provider.wallet.publicKey,
        50_000_000n,
        [],
        undefined,
        TOKEN_PROGRAM_ID,
      );
      const n = nextNonce();
      const [offer] = findOffer(maker.publicKey, n);
      const [ea] = findEscrowAuthority(offer);
      const esc = getAssociatedTokenAddressSync(offeredMint, ea, true, TOKEN_PROGRAM_ID);
      await program.methods
        .createOffer(n, offeredAmount, requestedAmount, exp)
        .accountsStrict({
          maker: maker.publicKey,
          offer,
          offeredMint,
          requestedMint,
          makerOfferedAta: ata,
          escrowAuthority: ea,
          escrowAta: esc,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([maker])
        .rpc();
      return { maker, offer, ea, esc, offeredMint, requestedMint, nonce: BigInt(n.toString()) };
    }

    const a = await createOne(mA, mX, mY);
    const b = await createOne(mB, mY, mZ);
    const c = await createOne(mC, mZ, mX);

    const snaps: OfferSnapshot[] = [a, b, c].map((o) => ({
      offer: o.offer,
      maker: o.maker.publicKey,
      nonce: o.nonce,
      version: 1,
      bump: 255,
      escrowBump: 255,
      status: "open" as const,
      offeredMint: o.offeredMint,
      requestedMint: o.requestedMint,
      offeredAmount: amt,
      requestedAmount: amt,
      createdAt: BigInt(blockTime),
      expiresAt: BigInt(expiresAt),
    }));
    const cand = findCycleCandidates(snaps, { nowUnixSeconds: BigInt(blockTime) }).candidates[0]!;
    // Ensure dest ATAs exist using the canonical A/B/C assignment from the matcher.
    // getOrCreateAssociatedTokenAccount handles the case where the ATA already exists.
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.x),
      new anchor.web3.PublicKey(cand.makers.c),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.y),
      new anchor.web3.PublicKey(cand.makers.a),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer!,
      new anchor.web3.PublicKey(cand.mints.z),
      new anchor.web3.PublicKey(cand.makers.b),
      false,
      "confirmed",
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await resolveCandidateAccounts(provider.connection, cand, "confirmed");
    expect(cand.validity.accountsResolved).to.equal(true);

    // cancel offer A -> candidate becomes stale
    const makerARefund = await createAccount(
      provider.connection,
      provider.wallet.payer!,
      mX,
      mA.publicKey,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID,
    );
    await program.methods
      .cancelOffer()
      .accountsStrict({
        maker: mA.publicKey,
        offer: a.offer,
        offeredMint: mX,
        escrowAuthority: a.ea,
        escrowAta: a.esc,
        makerTokenAccount: makerARefund,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mA])
      .rpc();

    await recheckCandidateState({
      connection: provider.connection,
      candidate: cand,
      nowUnixSeconds: BigInt(blockTime),
      commitment: "confirmed",
    });
    expect(cand.validity.rechecked?.ok).to.equal(false);

    const p = cand.settlementAccounts;
    try {
      await program.methods
        .settleCycle()
        .accountsStrict({
          offerA: new anchor.web3.PublicKey(p.offerA),
          offerB: new anchor.web3.PublicKey(p.offerB),
          offerC: new anchor.web3.PublicKey(p.offerC),
          mintX: new anchor.web3.PublicKey(p.mintX),
          mintY: new anchor.web3.PublicKey(p.mintY),
          mintZ: new anchor.web3.PublicKey(p.mintZ),
          escrowAuthorityA: new anchor.web3.PublicKey(p.escrowAuthorityA),
          escrowAuthorityB: new anchor.web3.PublicKey(p.escrowAuthorityB),
          escrowAuthorityC: new anchor.web3.PublicKey(p.escrowAuthorityC),
          escrowAtaA: new anchor.web3.PublicKey(p.escrowAtaA),
          escrowAtaB: new anchor.web3.PublicKey(p.escrowAtaB),
          escrowAtaC: new anchor.web3.PublicKey(p.escrowAtaC),
          destCReceivesX: new anchor.web3.PublicKey(p.destCReceivesX!),
          destAReceivesY: new anchor.web3.PublicKey(p.destAReceivesY!),
          destBReceivesZ: new anchor.web3.PublicKey(p.destBReceivesZ!),
          excessRefundA: new anchor.web3.PublicKey(p.excessRefundA!),
          excessRefundB: new anchor.web3.PublicKey(p.excessRefundB!),
          excessRefundC: new anchor.web3.PublicKey(p.excessRefundC!),
          makerA: new anchor.web3.PublicKey(p.makerA),
          makerB: new anchor.web3.PublicKey(p.makerB),
          makerC: new anchor.web3.PublicKey(p.makerC),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      expect.fail("should fail after cancel");
    } catch (e) {
      expectAnyError(e, [
        "OfferNotOpen",
        "AccountNotInitialized",
        "ConstraintAssociated",
        "AccountOwnedByWrongProgram",
      ]);
    }
  });
});
