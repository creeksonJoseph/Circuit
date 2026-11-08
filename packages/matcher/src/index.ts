import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import type {
  Cycle,
  CycleCandidate,
  DiscoveryOptions,
  DiscoveryResult,
  FindCyclesOptions,
  MatchResult,
  OfferEdge,
  OfferSnapshot,
  RecheckOptions,
} from "./types";
import { TOKEN_PROGRAM_ID_STR } from "./types";
import { decodeOfferAccount } from "./decode";
import { findMathCycles, isMathematicallyValidCycle } from "./match";
import { discoverOffers, resolveCandidateAccounts } from "./rpc";
import {
  buildSettleCycleAccountMap,
  buildSettleCycleFromPlan,
  formatTransactionFailure,
} from "./settle";

export const MATCHER_VERSION = "0.5.0";

export * from "./types";
export * from "./decode";
export * from "./match";
export * from "./pda";
export * from "./resolve";
export { discoverOffers, resolveCandidateAccounts };
export { buildSettleCycleAccountMap, buildSettleCycleFromPlan, formatTransactionFailure };

/** Back-compat: pure math cycle discovery returning legacy Cycle shape. */
export function findCycles(offers: readonly OfferEdge[], now: bigint): Cycle[] {
  const snaps: OfferSnapshot[] = offers.map((o) => ({
    ...o,
    nonce: 0n,
    version: 1,
    bump: 0,
    escrowBump: 0,
    status: "open",
    createdAt: 0n,
  }));
  const res = findMathCycles(snaps, { nowUnixSeconds: now, expirySafetyBufferSeconds: 0n });
  return res.candidates.map((c) => ({
    offers: c.offers.map((o) => ({
      offer: o.offer,
      maker: o.maker,
      offeredMint: o.offeredMint,
      requestedMint: o.requestedMint,
      offeredAmount: o.offeredAmount,
      requestedAmount: o.requestedAmount,
      expiresAt: o.expiresAt,
    })) as Cycle["offers"],
  }));
}

export function findCycleCandidates(
  offers: readonly OfferSnapshot[],
  opts: FindCyclesOptions & { maxCandidates?: number },
): MatchResult {
  return findMathCycles(offers, opts);
}

export async function discoverAndMatch(
  connection: Connection,
  opts: DiscoveryOptions & FindCyclesOptions & { maxCandidates?: number },
): Promise<{ discovery: DiscoveryResult; match: MatchResult }> {
  const discovery = await discoverOffers(connection, opts);
  const match = findMathCycles(
    discovery.offers.map((d) => d.snapshot),
    opts,
  );
  match.diagnostics.push(...discovery.diagnostics);
  return { discovery, match };
}

/**
 * Recheck the live fields and token-account preconditions used by settleCycle.
 * This is still a non-atomic preflight; Rust remains authoritative at execution time.
 */
export async function recheckCandidateState(
  opts: RecheckOptions & { candidate: CycleCandidate },
): Promise<CycleCandidate> {
  const { connection, candidate, nowUnixSeconds, expirySafetyBufferSeconds = 0n } = opts;
  const commitment = opts.commitment ?? "confirmed";
  const checks: string[] = [];
  let ok = true;
  const slot = await connection.getSlot(commitment);
  const liveOffers: OfferSnapshot[] = [];
  for (const off of candidate.offers) {
    const info = await connection.getAccountInfo(off.offer, commitment);
    if (!info) {
      ok = false;
      checks.push(`offer_missing:${off.offer.toBase58()}`);
      continue;
    }
    const dec = decodeOfferAccount(off.offer, Buffer.from(info.data), info.owner);
    if (!dec.ok) {
      ok = false;
      checks.push(`offer_decode:${off.offer.toBase58()}:${dec.reason}`);
      continue;
    }
    liveOffers.push(dec.snapshot);
    if (!sameOfferSnapshot(dec.snapshot, off)) {
      ok = false;
      checks.push(`offer_changed:${off.offer.toBase58()}`);
    }
    if (dec.snapshot.status !== "open") {
      ok = false;
      checks.push(`offer_not_open:${off.offer.toBase58()}:${dec.snapshot.status}`);
    }
    if (!(nowUnixSeconds < dec.snapshot.expiresAt)) {
      ok = false;
      checks.push(`offer_expired_onchain_rule:${off.offer.toBase58()}`);
    }
    if (nowUnixSeconds + expirySafetyBufferSeconds >= dec.snapshot.expiresAt) {
      checks.push(`offer_within_safety_buffer:${off.offer.toBase58()}`);
    }
  }
  if (
    liveOffers.length === 3 &&
    !isMathematicallyValidCycle(liveOffers[0]!, liveOffers[1]!, liveOffers[2]!, nowUnixSeconds)
  ) {
    ok = false;
    checks.push("live_cycle_invalid");
  }
  const tokenProgram = new PublicKey(TOKEN_PROGRAM_ID_STR);
  const escrowChecks: readonly [string, string, string, string, bigint][] = [
    [
      "escrowAtaA",
      candidate.settlementAccounts.escrowAtaA,
      candidate.mints.x,
      candidate.settlementAccounts.escrowAuthorityA,
      candidate.offers[0]!.offeredAmount,
    ],
    [
      "escrowAtaB",
      candidate.settlementAccounts.escrowAtaB,
      candidate.mints.y,
      candidate.settlementAccounts.escrowAuthorityB,
      candidate.offers[1]!.offeredAmount,
    ],
    [
      "escrowAtaC",
      candidate.settlementAccounts.escrowAtaC,
      candidate.mints.z,
      candidate.settlementAccounts.escrowAuthorityC,
      candidate.offers[2]!.offeredAmount,
    ],
  ];
  for (const [label, ata, expectedMint, expectedOwner, requiredAmount] of escrowChecks) {
    const info = await connection.getAccountInfo(new PublicKey(ata), commitment);
    if (!info) {
      ok = false;
      checks.push(`escrow_missing:${label}`);
    } else if (!info.owner.equals(tokenProgram)) {
      ok = false;
      checks.push(`escrow_wrong_owner:${label}`);
    } else if (Buffer.from(info.data).length < 72) {
      ok = false;
      checks.push(`escrow_short:${label}`);
    } else {
      const data = Buffer.from(info.data);
      const mint = new PublicKey(data.subarray(0, 32)).toBase58();
      const owner = new PublicKey(data.subarray(32, 64)).toBase58();
      const amount = data.readBigUInt64LE(64);
      if (mint !== expectedMint || owner !== expectedOwner) {
        ok = false;
        checks.push(`escrow_mismatch:${label}`);
      }
      if (amount < requiredAmount) {
        ok = false;
        checks.push(`escrow_insufficient:${label}`);
      } else {
        checks.push(`escrow_ok:${label}`);
      }
    }
  }
  for (const r of candidate.accountResolutions) {
    if (r.status !== "resolved" || !r.selected) {
      ok = false;
      checks.push(`resolution_not_ready:${r.role}:${r.status}`);
      continue;
    }
    const info = await connection.getAccountInfo(new PublicKey(r.selected), commitment);
    if (!info) {
      ok = false;
      checks.push(`token_missing:${r.role}`);
      continue;
    }
    if (!info.owner.equals(tokenProgram)) {
      ok = false;
      checks.push(`token_wrong_program:${r.role}`);
      continue;
    }
    const data = Buffer.from(info.data);
    if (data.length < 64) {
      ok = false;
      checks.push(`token_short:${r.role}`);
      continue;
    }
    const mint = new PublicKey(data.subarray(0, 32)).toBase58();
    const owner = new PublicKey(data.subarray(32, 64)).toBase58();
    const spec = roleExpected(r.role, candidate);
    if (mint !== spec.mint || owner !== spec.owner) {
      ok = false;
      checks.push(`token_mismatch:${r.role}`);
    } else checks.push(`token_ok:${r.role}`);
  }
  candidate.validity.rechecked = { atSlot: slot, commitment, checks, ok };
  if (!ok)
    candidate.warnings.push(
      "Recheck found issues; candidate may be unexecutable. On-chain remains authoritative.",
    );
  return candidate;
}

function sameOfferSnapshot(a: OfferSnapshot, b: OfferSnapshot): boolean {
  return (
    a.offer.equals(b.offer) &&
    a.maker.equals(b.maker) &&
    a.nonce === b.nonce &&
    a.version === b.version &&
    a.bump === b.bump &&
    a.escrowBump === b.escrowBump &&
    a.status === b.status &&
    a.offeredMint.equals(b.offeredMint) &&
    a.requestedMint.equals(b.requestedMint) &&
    a.offeredAmount === b.offeredAmount &&
    a.requestedAmount === b.requestedAmount &&
    a.createdAt === b.createdAt &&
    a.expiresAt === b.expiresAt
  );
}

function roleExpected(role: string, c: CycleCandidate): { mint: string; owner: string } {
  switch (role) {
    case "dest_c_receives_x":
      return { mint: c.mints.x, owner: c.makers.c };
    case "dest_a_receives_y":
      return { mint: c.mints.y, owner: c.makers.a };
    case "dest_b_receives_z":
      return { mint: c.mints.z, owner: c.makers.b };
    case "excess_refund_a":
      return { mint: c.mints.x, owner: c.makers.a };
    case "excess_refund_b":
      return { mint: c.mints.y, owner: c.makers.b };
    case "excess_refund_c":
      return { mint: c.mints.z, owner: c.makers.c };
    default:
      return { mint: "", owner: "" };
  }
}
