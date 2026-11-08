import { describe, expect, it } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  MATCHER_VERSION,
  decodeOfferAccount,
  filterEligibleOffers,
  findCycleCandidates,
  findCycles,
  isMathematicallyValidCycle,
  serializeCandidate,
  recheckCandidateState,
  OFFER_DISCRIMINATOR,
  OFFER_ACCOUNT_SIZE,
} from "../src/index";
import { findEscrowAuthorityPda, getCanonicalAta } from "../src/pda";
import {
  resolveTokenAccountRole,
  planRoles,
  applyResolutionsToPlan,
  allResolved,
} from "../src/resolve";
import type { OfferSnapshot } from "../src/types";

function snap(
  over: Partial<OfferSnapshot> & { offer?: PublicKey; maker?: PublicKey },
): OfferSnapshot {
  const base = {
    offer: over.offer ?? Keypair.generate().publicKey,
    maker: over.maker ?? Keypair.generate().publicKey,
    nonce: over.nonce ?? 1n,
    version: 1,
    bump: 255,
    escrowBump: 254,
    status: "open" as const,
    offeredMint: over.offeredMint ?? Keypair.generate().publicKey,
    requestedMint: over.requestedMint ?? Keypair.generate().publicKey,
    offeredAmount: over.offeredAmount ?? 1_000_000n,
    requestedAmount: over.requestedAmount ?? 2_000_000n,
    createdAt: 0n,
    expiresAt: over.expiresAt ?? 9_999_999_999n,
  };
  return { ...base, ...over };
}

function makeCycle(now: bigint): [OfferSnapshot, OfferSnapshot, OfferSnapshot] {
  const mA = Keypair.generate().publicKey;
  const mB = Keypair.generate().publicKey;
  const mC = Keypair.generate().publicKey;
  const X = Keypair.generate().publicKey;
  const Y = Keypair.generate().publicKey;
  const Z = Keypair.generate().publicKey;
  const exp = now + 3600n;
  const A = snap({
    maker: mA,
    offeredMint: X,
    requestedMint: Y,
    offeredAmount: 100n,
    requestedAmount: 200n,
    expiresAt: exp,
    nonce: 1n,
  });
  const B = snap({
    maker: mB,
    offeredMint: Y,
    requestedMint: Z,
    offeredAmount: 200n,
    requestedAmount: 300n,
    expiresAt: exp,
    nonce: 2n,
  });
  const C = snap({
    maker: mC,
    offeredMint: Z,
    requestedMint: X,
    offeredAmount: 300n,
    requestedAmount: 100n,
    expiresAt: exp,
    nonce: 3n,
  });
  return [A, B, C];
}

describe("matcher Stage 5", () => {
  it("exposes version", () => {
    expect(MATCHER_VERSION).toBe("0.5.0");
  });

  it("back-compat findCycles returns legacy cycles for valid math", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const res = findCycles([A, B, C], now);
    expect(res.length).toBe(1);
    expect(res[0]!.offers).toHaveLength(3);
  });

  it("valid 3-offer cycle produces candidate with 22-account plan mapping", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const res = findCycleCandidates([A, B, C], { nowUnixSeconds: now });
    expect(res.candidates.length).toBe(1);
    const c = res.candidates[0]!;
    expect(c.validity.tier1).toBe("mathematically_valid");
    expect(c.validity.accountsResolved).toBe(false);
    // canonical rotation may reorder; assert mapping consistency and plan derivations
    const [cA, cB, cC] = c.offers;
    expect(c.mints.x).toBe(cA.offeredMint.toBase58());
    expect(c.mints.y).toBe(cB.offeredMint.toBase58());
    expect(c.mints.z).toBe(cC.offeredMint.toBase58());
    expect(c.settlementAccounts.makerA).toBe(cA.maker.toBase58());
    expect(c.settlementAccounts.makerC).toBe(cC.maker.toBase58());
    expect(c.settlementAccounts.tokenProgram).toBe("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    expect(c.agreedAmounts.a).toBe(cA.offeredAmount.toString());
    const [eaA] = findEscrowAuthorityPda(cA.offer);
    expect(c.settlementAccounts.escrowAuthorityA).toBe(eaA.toBase58());
    expect(c.settlementAccounts.escrowAtaA).toBe(
      getCanonicalAta(cA.offeredMint, eaA, true).toBase58(),
    );
    expect(Object.keys(c.settlementAccounts)).toHaveLength(22);
  });

  it("incorrect mint rotation rejected", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const badC = snap({ ...C, requestedMint: Keypair.generate().publicKey });
    expect(findCycleCandidates([A, B, badC], { nowUnixSeconds: now }).candidates.length).toBe(0);
  });

  it("incorrect amount compatibility rejected", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const badB = snap({ ...B, offeredAmount: 201n });
    expect(findCycleCandidates([A, badB, C], { nowUnixSeconds: now }).candidates.length).toBe(0);
  });

  it("duplicate offers/makers/offered mints rejected by validity", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    expect(isMathematicallyValidCycle(A, A, B, now)).toBe(false);
    const sameMakerB = snap({ ...B, maker: A.maker });
    expect(isMathematicallyValidCycle(A, sameMakerB, C, now)).toBe(false);
    const sameMintB = snap({ ...B, offeredMint: A.offeredMint, requestedMint: C.offeredMint });
    expect(isMathematicallyValidCycle(A, sameMintB, C, now)).toBe(false);
  });

  it("expiry: conservative buffer is separate from on-chain rule", () => {
    const now = 1000n;
    const [A, B, C] = makeCycle(now);
    const near = snap({ ...A, expiresAt: now + 5n });
    // on-chain rule now < expiresAt is true (1000 < 1005), but buffer 10 filters it
    expect(
      filterEligibleOffers([near, B, C], {
        nowUnixSeconds: now,
        expirySafetyBufferSeconds: 10n,
      }).some((o) => o.offer.equals(near.offer)),
    ).toBe(false);
    expect(
      filterEligibleOffers([near, B, C], {
        nowUnixSeconds: now,
        expirySafetyBufferSeconds: 0n,
      }).some((o) => o.offer.equals(near.offer)),
    ).toBe(true);
    expect(isMathematicallyValidCycle(near, B, C, now)).toBe(true);
    const expired = snap({ ...A, expiresAt: now });
    expect(isMathematicallyValidCycle(expired, B, C, now)).toBe(false);
  });

  it("non-Open offers excluded", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const settledA = snap({ ...A, status: "settled" });
    expect(findCycleCandidates([settledA, B, C], { nowUnixSeconds: now }).candidates.length).toBe(
      0,
    );
  });

  it("multiple valid cycles sharing offers returned with conflict metadata; deterministic order", () => {
    const now = 1_000_000n;
    const mA = Keypair.generate().publicKey,
      mB = Keypair.generate().publicKey,
      mC = Keypair.generate().publicKey,
      mD = Keypair.generate().publicKey;
    const X = Keypair.generate().publicKey,
      Y = Keypair.generate().publicKey,
      Z = Keypair.generate().publicKey,
      W = Keypair.generate().publicKey;
    const exp = now + 3600n;
    // A gives X wants Y; B gives Y wants Z; C gives Z wants X (cycle 1)
    // A gives X wants Y; D gives Y wants W is not a cycle with C; create: A shared in two cycles
    const A = snap({
      maker: mA,
      offeredMint: X,
      requestedMint: Y,
      offeredAmount: 1n,
      requestedAmount: 1n,
      expiresAt: exp,
      nonce: 1n,
    });
    const B = snap({
      maker: mB,
      offeredMint: Y,
      requestedMint: Z,
      offeredAmount: 1n,
      requestedAmount: 1n,
      expiresAt: exp,
      nonce: 2n,
    });
    const C = snap({
      maker: mC,
      offeredMint: Z,
      requestedMint: X,
      offeredAmount: 1n,
      requestedAmount: 1n,
      expiresAt: exp,
      nonce: 3n,
    });
    const D = snap({
      maker: mB,
      offeredMint: Y,
      requestedMint: W,
      offeredAmount: 1n,
      requestedAmount: 1n,
      expiresAt: exp,
      nonce: 4n,
    });
    const E = snap({
      maker: mD,
      offeredMint: W,
      requestedMint: X,
      offeredAmount: 1n,
      requestedAmount: 1n,
      expiresAt: exp,
      nonce: 5n,
    });
    const res = findCycleCandidates([A, B, C, D, E], { nowUnixSeconds: now });
    expect(res.candidates.length).toBe(2);
    // deterministic
    const res2 = findCycleCandidates([E, C, A, D, B], { nowUnixSeconds: now });
    expect(res2.candidates.map((c) => c.cycleId)).toEqual(res.candidates.map((c) => c.cycleId));
    const shared = res.candidates.some((c) =>
      c.conflicts.sharedOffers.includes(A.offer.toBase58()),
    );
    expect(shared).toBe(true);
    expect(res.candidates[0]!.conflicts.note).toMatch(/cannot all settle/);
  });

  it("rotation deduplication", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const res = findCycleCandidates([B, C, A], { nowUnixSeconds: now });
    expect(res.candidates.length).toBe(1);
  });

  it("token account resolution: canonical preferred, unique noncanonical selected, ambiguous/missing", () => {
    const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const mint = Keypair.generate().publicKey;
    const owner = Keypair.generate().publicKey;
    const canonical = getCanonicalAta(mint, owner, false);
    const noncanon1 = Keypair.generate().publicKey;
    const noncanon2 = Keypair.generate().publicKey;
    function ta(pubkey: PublicKey, m: PublicKey, o: PublicKey) {
      const d = Buffer.alloc(165);
      m.toBuffer().copy(d, 0);
      o.toBuffer().copy(d, 32);
      return { pubkey, account: { data: d, owner: tokenProgram } };
    }
    // canonical present wins
    const r1 = resolveTokenAccountRole(
      "dest_c_receives_x",
      mint,
      owner,
      [ta(noncanon1, mint, owner), ta(canonical, mint, owner)],
      tokenProgram,
    );
    expect(r1.status).toBe("resolved");
    expect(r1.selected).toBe(canonical.toBase58());
    // single valid noncanonical
    const r2 = resolveTokenAccountRole(
      "excess_refund_a",
      mint,
      owner,
      [ta(noncanon1, mint, owner)],
      tokenProgram,
    );
    expect(r2.status).toBe("resolved");
    expect(r2.selected).toBe(noncanon1.toBase58());
    // ambiguous
    const r3 = resolveTokenAccountRole(
      "dest_a_receives_y",
      mint,
      owner,
      [ta(noncanon1, mint, owner), ta(noncanon2, mint, owner)],
      tokenProgram,
    );
    expect(r3.status).toBe("ambiguous");
    expect(r3.selected).toBeUndefined();
    // missing
    const r4 = resolveTokenAccountRole("dest_b_receives_z", mint, owner, [], tokenProgram);
    expect(r4.status).toBe("missing");
    // wrong mint/owner ignored (never selected)
    const r5 = resolveTokenAccountRole(
      "excess_refund_b",
      mint,
      owner,
      [ta(noncanon1, Keypair.generate().publicKey, owner)],
      tokenProgram,
    );
    expect(r5.status).toBe("missing");
    // balance is irrelevant - not modeled; ensure logic uses no amount (implicit)
  });

  it("planRoles/applyResolutions/allResolved", () => {
    const [A, B, C] = makeCycle(1_000_000n);
    const roles = planRoles(A, B, C);
    expect(roles).toHaveLength(6);
    const plan = findCycleCandidates([A, B, C], { nowUnixSeconds: 1_000_000n }).candidates[0]!
      .settlementAccounts;
    const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const res = roles.map((r) => {
      const ata = getCanonicalAta(r.mint, r.owner, false);
      const d = Buffer.alloc(165);
      r.mint.toBuffer().copy(d, 0);
      r.owner.toBuffer().copy(d, 32);
      return resolveTokenAccountRole(
        r.role,
        r.mint,
        r.owner,
        [{ pubkey: ata, account: { data: d, owner: tokenProgram } }],
        tokenProgram,
      );
    });
    applyResolutionsToPlan(plan, res);
    expect(allResolved(res)).toBe(true);
    expect(plan.destCReceivesX).toBeTruthy();
  });

  it("decodeOfferAccount rejects malformed/bad discriminator/wrong size", () => {
    const pk = Keypair.generate().publicKey;
    expect(decodeOfferAccount(pk, Buffer.alloc(10)).ok).toBe(false);
    const bad = Buffer.alloc(OFFER_ACCOUNT_SIZE);
    bad[0] = 1;
    expect(decodeOfferAccount(pk, bad).ok).toBe(false);
    // build valid
    const buf = Buffer.alloc(OFFER_ACCOUNT_SIZE);
    Buffer.from(OFFER_DISCRIMINATOR).copy(buf, 0);
    let o = 8;
    buf.writeUInt8(1, o++);
    buf.writeUInt8(255, o++);
    buf.writeUInt8(254, o++);
    buf.writeUInt8(0, o++); // v,bump,ebump,open
    Keypair.generate().publicKey.toBuffer().copy(buf, o);
    o += 32;
    buf.writeBigUInt64LE(7n, o);
    o += 8;
    const m1 = Keypair.generate().publicKey;
    m1.toBuffer().copy(buf, o);
    o += 32;
    const m2 = Keypair.generate().publicKey;
    m2.toBuffer().copy(buf, o);
    o += 32;
    buf.writeBigUInt64LE(10n, o);
    o += 8;
    buf.writeBigUInt64LE(20n, o);
    o += 8;
    buf.writeBigInt64LE(0n, o);
    o += 8;
    buf.writeBigInt64LE(999999n, o);
    void o;
    const ok = decodeOfferAccount(pk, buf);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.snapshot.nonce).toBe(7n);
      expect(ok.snapshot.offeredAmount).toBe(10n);
    }
  });

  it("bigint boundaries and JSON-safe serialization", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const bigA = snap({ ...A, offeredAmount: (1n << 63n) - 1n, requestedAmount: 200n });
    const bigB = snap({ ...B, offeredAmount: 200n, requestedAmount: 300n });
    const bigC = snap({ ...C, offeredAmount: 300n, requestedAmount: (1n << 63n) - 1n });
    const res = findCycleCandidates([bigA, bigB, bigC], { nowUnixSeconds: now });
    expect(res.candidates.length).toBe(1);
    const ser = serializeCandidate(res.candidates[0]!);
    const json = JSON.stringify(ser);
    expect(json).toContain(((1n << 63n) - 1n).toString());
  });

  it("candidate states: tier1 always; accountsResolved only when all roles resolved; rechecked optional", () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const c = findCycleCandidates([A, B, C], { nowUnixSeconds: now }).candidates[0]!;
    expect(c.validity.tier1).toBe("mathematically_valid");
    expect(c.validity.accountsResolved).toBe(false);
    expect(c.validity.rechecked).toBeUndefined();
    expect(c.warnings.some((w) => w.includes("does not guarantee execution"))).toBe(true);
  });

  it("recheck detects a live offer field change before account checks", async () => {
    const now = 1_000_000n;
    const [A, B, C] = makeCycle(now);
    const candidate = findCycleCandidates([A, B, C], { nowUnixSeconds: now }).candidates[0]!;
    const changedA = { ...A, offeredAmount: A.offeredAmount + 1n };
    const encode = (offer: OfferSnapshot): Buffer => {
      const data = Buffer.alloc(OFFER_ACCOUNT_SIZE);
      Buffer.from(OFFER_DISCRIMINATOR).copy(data, 0);
      let offset = 8;
      data.writeUInt8(offer.version, offset++);
      data.writeUInt8(offer.bump, offset++);
      data.writeUInt8(offer.escrowBump, offset++);
      data.writeUInt8(0, offset++);
      offer.maker.toBuffer().copy(data, offset);
      offset += 32;
      data.writeBigUInt64LE(offer.nonce, offset);
      offset += 8;
      offer.offeredMint.toBuffer().copy(data, offset);
      offset += 32;
      offer.requestedMint.toBuffer().copy(data, offset);
      offset += 32;
      data.writeBigUInt64LE(offer.offeredAmount, offset);
      offset += 8;
      data.writeBigUInt64LE(offer.requestedAmount, offset);
      offset += 8;
      data.writeBigInt64LE(offer.createdAt, offset);
      offset += 8;
      data.writeBigInt64LE(offer.expiresAt, offset);
      return data;
    };
    const offerData = new Map([
      [A.offer.toBase58(), encode(changedA)],
      [B.offer.toBase58(), encode(B)],
      [C.offer.toBase58(), encode(C)],
    ]);
    const connection = {
      getSlot: async () => 1,
      getAccountInfo: async (key: PublicKey) => {
        const data = offerData.get(key.toBase58());
        return data
          ? { data, owner: new PublicKey("4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc") }
          : null;
      },
    } as never;
    await recheckCandidateState({
      connection,
      candidate,
      nowUnixSeconds: now,
      commitment: "confirmed",
    });
    expect(candidate.validity.rechecked?.ok).toBe(false);
    expect(candidate.validity.rechecked?.checks).toContain(`offer_changed:${A.offer.toBase58()}`);
  });

  it("truncation is explicit", () => {
    const now = 1_000_000n;
    const offers: OfferSnapshot[] = [];
    // build 3 independent cycles
    for (let i = 0; i < 3; i++) {
      const [A, B, C] = makeCycle(now);
      // make unique mints by regenerating - makeCycle already unique per call
      offers.push(A, B, C);
    }
    const res = findCycleCandidates(offers, { nowUnixSeconds: now, maxCandidates: 1 });
    expect(res.candidates.length).toBe(1);
    expect(res.truncated).toBe(true);
    expect(res.truncationReason).toContain("capped_at_1");
  });
});
