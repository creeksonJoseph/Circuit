import type {
  AccountResolution,
  CycleCandidate,
  CycleConflict,
  FindCyclesOptions,
  MatchResult,
  OfferSnapshot,
  SettlementAccountPlan,
  TokenAccountRole,
} from "./types";
import { TOKEN_PROGRAM_ID_STR } from "./types";
import { findEscrowAuthorityPda, getCanonicalAta } from "./pda";

function pk(o: OfferSnapshot): string {
  return o.offer.toBase58();
}

export function isConservativelyEligible(
  o: OfferSnapshot,
  nowUnixSeconds: bigint,
  expirySafetyBufferSeconds: bigint,
): boolean {
  if (o.status !== "open") return false;
  if (o.offeredAmount <= 0n || o.requestedAmount <= 0n) return false;
  if (o.offeredMint.equals(o.requestedMint)) return false;
  // Conservative off-chain filter (separate from on-chain rule `now < expires_at`).
  return nowUnixSeconds + expirySafetyBufferSeconds < o.expiresAt;
}

export function filterEligibleOffers(
  offers: readonly OfferSnapshot[],
  opts: FindCyclesOptions,
): OfferSnapshot[] {
  const buf = opts.expirySafetyBufferSeconds ?? 0n;
  return offers.filter((o) => isConservativelyEligible(o, opts.nowUnixSeconds, buf));
}

export function isMathematicallyValidCycle(
  a: OfferSnapshot,
  b: OfferSnapshot,
  c: OfferSnapshot,
  nowUnixSeconds: bigint,
): boolean {
  // Mirrors settle_cycle.rs mapping/constraints (best-effort; on-chain authoritative).
  if (a.status !== "open" || b.status !== "open" || c.status !== "open") return false;
  if (!(
    nowUnixSeconds < a.expiresAt &&
    nowUnixSeconds < b.expiresAt &&
    nowUnixSeconds < c.expiresAt
  )) {
    return false;
  }
  const oa = pk(a),
    ob = pk(b),
    oc = pk(c);
  if (oa === ob || oa === oc || ob === oc) return false;
  const ma = a.maker.toBase58(),
    mb = b.maker.toBase58(),
    mc = c.maker.toBase58();
  if (ma === mb || ma === mc || mb === mc) return false;
  const x = a.offeredMint.toBase58(),
    y = b.offeredMint.toBase58(),
    z = c.offeredMint.toBase58();
  if (x === y || x === z || y === z) return false;
  if (a.requestedAmount !== b.offeredAmount) return false;
  if (b.requestedAmount !== c.offeredAmount) return false;
  if (c.requestedAmount !== a.offeredAmount) return false;
  if (a.requestedMint.toBase58() !== y) return false;
  if (b.requestedMint.toBase58() !== z) return false;
  if (c.requestedMint.toBase58() !== x) return false;
  return true;
}

type Triple = [OfferSnapshot, OfferSnapshot, OfferSnapshot];

function canonicalizeRotation(a: OfferSnapshot, b: OfferSnapshot, c: OfferSnapshot): Triple {
  const triples: Triple[] = [
    [a, b, c],
    [b, c, a],
    [c, a, b],
  ];
  triples.sort((t1, t2) => pk(t1[0]).localeCompare(pk(t2[0])));
  return triples[0]!;
}

function cycleId(t: Triple): string {
  return `${pk(t[0])}|${pk(t[1])}|${pk(t[2])}`;
}

function derivablePlan(
  a: OfferSnapshot,
  b: OfferSnapshot,
  c: OfferSnapshot,
): SettlementAccountPlan {
  const [eaA] = findEscrowAuthorityPda(a.offer);
  const [eaB] = findEscrowAuthorityPda(b.offer);
  const [eaC] = findEscrowAuthorityPda(c.offer);
  const escA = getCanonicalAta(a.offeredMint, eaA, true);
  const escB = getCanonicalAta(b.offeredMint, eaB, true);
  const escC = getCanonicalAta(c.offeredMint, eaC, true);
  return {
    offerA: a.offer.toBase58(),
    offerB: b.offer.toBase58(),
    offerC: c.offer.toBase58(),
    mintX: a.offeredMint.toBase58(),
    mintY: b.offeredMint.toBase58(),
    mintZ: c.offeredMint.toBase58(),
    escrowAuthorityA: eaA.toBase58(),
    escrowAuthorityB: eaB.toBase58(),
    escrowAuthorityC: eaC.toBase58(),
    escrowAtaA: escA.toBase58(),
    escrowAtaB: escB.toBase58(),
    escrowAtaC: escC.toBase58(),
    destCReceivesX: null,
    destAReceivesY: null,
    destBReceivesZ: null,
    excessRefundA: null,
    excessRefundB: null,
    excessRefundC: null,
    makerA: a.maker.toBase58(),
    makerB: b.maker.toBase58(),
    makerC: c.maker.toBase58(),
    tokenProgram: TOKEN_PROGRAM_ID_STR,
  };
}

function emptyResolutions(): AccountResolution[] {
  const roles: TokenAccountRole[] = [
    "dest_c_receives_x",
    "dest_a_receives_y",
    "dest_b_receives_z",
    "excess_refund_a",
    "excess_refund_b",
    "excess_refund_c",
  ];
  return roles.map((role) => ({ role, status: "missing" as const, reason: "not_resolved" }));
}

function buildConflicts(candidates: CycleCandidate[]): void {
  const offerToIdx = new Map<string, number[]>();
  const makerToIdx = new Map<string, number[]>();
  candidates.forEach((c, i) => {
    c.offers.forEach((o) => {
      const k = o.offer.toBase58();
      if (!offerToIdx.has(k)) offerToIdx.set(k, []);
      offerToIdx.get(k)!.push(i);
    });
    [c.makers.a, c.makers.b, c.makers.c].forEach((m) => {
      if (!makerToIdx.has(m)) makerToIdx.set(m, []);
      makerToIdx.get(m)!.push(i);
    });
  });
  const sharedOffers = [...offerToIdx.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
  const sharedMakers = [...makerToIdx.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
  candidates.forEach((c, i) => {
    const related = new Set<number>();
    c.offers.forEach((o) =>
      (offerToIdx.get(o.offer.toBase58()) ?? []).forEach((j) => j !== i && related.add(j)),
    );
    [c.makers.a, c.makers.b, c.makers.c].forEach((m) =>
      (makerToIdx.get(m) ?? []).forEach((j) => j !== i && related.add(j)),
    );
    c.conflicts = {
      sharedOffers: sharedOffers.filter((s) => c.offers.some((o) => o.offer.toBase58() === s)),
      sharedMakers: sharedMakers.filter(
        (m) => m === c.makers.a || m === c.makers.b || m === c.makers.c,
      ),
      conflictingCandidateIndices: [...related].sort((a, b) => a - b),
      note: "Competing candidates that share an offer cannot all settle successfully; only one settlement can consume an Open offer (on-chain enforces status/constraints).",
    } satisfies CycleConflict;
  });
}

export interface MatchOptions extends FindCyclesOptions {
  maxCandidates?: number;
}

export function findMathCycles(offers: readonly OfferSnapshot[], opts: MatchOptions): MatchResult {
  const now = opts.nowUnixSeconds;
  const buf = opts.expirySafetyBufferSeconds ?? 0n;
  const eligible = filterEligibleOffers(offers, {
    nowUnixSeconds: now,
    expirySafetyBufferSeconds: buf,
  });
  const byOffered = new Map<string, OfferSnapshot[]>();
  for (const o of eligible) {
    const k = `${o.offeredMint.toBase58()}:${o.offeredAmount.toString()}`;
    if (!byOffered.has(k)) byOffered.set(k, []);
    byOffered.get(k)!.push(o);
  }
  const seen = new Set<string>();
  const found: Triple[] = [];
  for (const a of eligible) {
    const bKey = `${a.requestedMint.toBase58()}:${a.requestedAmount.toString()}`;
    const bs = byOffered.get(bKey) ?? [];
    for (const b of bs) {
      if (pk(b) === pk(a)) continue;
      if (b.requestedMint.equals(a.offeredMint)) continue; // Z would equal X
      const cKey = `${b.requestedMint.toBase58()}:${b.requestedAmount.toString()}`;
      const cs = byOffered.get(cKey) ?? [];
      for (const c of cs) {
        if (pk(c) === pk(a) || pk(c) === pk(b)) continue;
        if (!c.requestedMint.equals(a.offeredMint)) continue;
        if (c.requestedAmount !== a.offeredAmount) continue;
        if (!isMathematicallyValidCycle(a, b, c, now)) continue;
        const canon = canonicalizeRotation(a, b, c);
        const id = cycleId(canon);
        if (seen.has(id)) continue;
        seen.add(id);
        found.push(canon);
      }
    }
  }
  found.sort((t1, t2) => {
    const a = pk(t1[0]).localeCompare(pk(t2[0]));
    if (a !== 0) return a;
    const b = pk(t1[1]).localeCompare(pk(t2[1]));
    if (b !== 0) return b;
    return pk(t1[2]).localeCompare(pk(t2[2]));
  });
  let truncated = false;
  let truncationReason: string | undefined;
  let out = found;
  if (opts.maxCandidates !== undefined && found.length > opts.maxCandidates) {
    out = found.slice(0, opts.maxCandidates);
    truncated = true;
    truncationReason = `capped_at_${opts.maxCandidates}`;
  }
  const discoveredAt = new Date().toISOString();
  const candidates: CycleCandidate[] = out.map((t) => {
    const [A, B, C] = t;
    return {
      cycleId: cycleId(t),
      offers: t,
      mints: {
        x: A.offeredMint.toBase58(),
        y: B.offeredMint.toBase58(),
        z: C.offeredMint.toBase58(),
      },
      makers: {
        a: A.maker.toBase58(),
        b: B.maker.toBase58(),
        c: C.maker.toBase58(),
      },
      agreedAmounts: {
        a: A.offeredAmount.toString(),
        b: B.offeredAmount.toString(),
        c: C.offeredAmount.toString(),
      },
      validity: { tier1: "mathematically_valid", accountsResolved: false },
      settlementAccounts: derivablePlan(A, B, C),
      accountResolutions: emptyResolutions(),
      conflicts: {
        sharedOffers: [],
        sharedMakers: [],
        conflictingCandidateIndices: [],
        note: "",
      },
      discoveredAt,
      nowUnixSecondsUsed: now.toString(),
      expirySafetyBufferSeconds: buf.toString(),
      warnings: [
        "Snapshot only; discovery does not guarantee execution. On-chain settleCycle is authoritative.",
      ],
    };
  });
  buildConflicts(candidates);
  return { candidates, truncated, truncationReason, diagnostics: [] };
}
