import type { Commitment, PublicKey } from "@solana/web3.js";

/** SPL Token program (original). */
export const TOKEN_PROGRAM_ID_STR = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
/** Associated Token Account program. */
export const ASSOCIATED_TOKEN_PROGRAM_ID_STR = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
/** Circuit program (localnet/devnet per IDL). */
export const CIRCUIT_PROGRAM_ID_STR = "4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc";

/** 8-byte Anchor discriminator for `Offer` account. */
export const OFFER_DISCRIMINATOR = new Uint8Array([215, 88, 60, 71, 170, 162, 73, 229]);
export const OFFER_ACCOUNT_SIZE = 148;

export type OfferStatusName = "open" | "settled" | "cancelled" | "expired";

/** One offer snapshot (decoded). Amounts/timestamps are integer base units (bigint). */
export interface OfferSnapshot {
  offer: PublicKey;
  maker: PublicKey;
  nonce: bigint;
  version: number;
  bump: number;
  escrowBump: number;
  status: OfferStatusName;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  offeredAmount: bigint;
  requestedAmount: bigint;
  createdAt: bigint;
  expiresAt: bigint;
}

/** Legacy edge shape kept for compatibility with existing types; prefer OfferSnapshot. */
export interface OfferEdge {
  offer: PublicKey;
  maker: PublicKey;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  offeredAmount: bigint;
  requestedAmount: bigint;
  expiresAt: bigint;
}

export interface Cycle {
  offers: [OfferEdge, OfferEdge, OfferEdge];
}

export type TokenAccountRole =
  | "dest_c_receives_x"
  | "dest_a_receives_y"
  | "dest_b_receives_z"
  | "excess_refund_a"
  | "excess_refund_b"
  | "excess_refund_c";

export type AccountResolutionStatus = "derivable" | "resolved" | "ambiguous" | "missing";

export interface TokenAccountCandidate {
  pubkey: string;
  isCanonicalAta: boolean;
}

export interface AccountResolution {
  role: TokenAccountRole;
  status: AccountResolutionStatus;
  selected?: string;
  candidates?: TokenAccountCandidate[];
  reason?: string;
}

export interface SettlementAccountPlan {
  offerA: string;
  offerB: string;
  offerC: string;
  mintX: string;
  mintY: string;
  mintZ: string;
  escrowAuthorityA: string;
  escrowAuthorityB: string;
  escrowAuthorityC: string;
  escrowAtaA: string;
  escrowAtaB: string;
  escrowAtaC: string;
  destCReceivesX: string | null;
  destAReceivesY: string | null;
  destBReceivesZ: string | null;
  excessRefundA: string | null;
  excessRefundB: string | null;
  excessRefundC: string | null;
  makerA: string;
  makerB: string;
  makerC: string;
  tokenProgram: string;
}

export interface CycleConflict {
  /** Offer pubkeys shared by more than one candidate in this result set. */
  sharedOffers: string[];
  /** Makers appearing in more than one candidate in this result set. */
  sharedMakers: string[];
  /** Candidate indices (in deterministic output order) that conflict with this candidate. */
  conflictingCandidateIndices: number[];
  note: string;
}

export type CandidateTier1 = "mathematically_valid";
export interface CandidateTiers {
  tier1: CandidateTier1;
  accountsResolved: boolean;
  rechecked?: {
    atSlot?: number;
    commitment?: Commitment;
    checks: string[];
    ok: boolean;
  };
}

export interface CycleCandidate {
  cycleId: string;
  offers: [OfferSnapshot, OfferSnapshot, OfferSnapshot];
  mints: { x: string; y: string; z: string };
  makers: { a: string; b: string; c: string };
  agreedAmounts: { a: string; b: string; c: string };
  validity: CandidateTiers;
  settlementAccounts: SettlementAccountPlan;
  accountResolutions: AccountResolution[];
  conflicts: CycleConflict;
  discoveredAt: string;
  slot?: number;
  commitment?: Commitment;
  nowUnixSecondsUsed: string;
  expirySafetyBufferSeconds: string;
  warnings: string[];
}

export interface FindCyclesOptions {
  /** Explicit unix seconds (i64 semantics). Required for pure matching. */
  nowUnixSeconds: bigint;
  /** Conservative buffer; excludes when now + buffer >= expiresAt. Separate from on-chain rule. */
  expirySafetyBufferSeconds?: bigint;
}

export interface MatchResult {
  candidates: CycleCandidate[];
  truncated: boolean;
  truncationReason?: string;
  /** Non-fatal diagnostics (e.g. malformed accounts skipped by RPC adapter). */
  diagnostics: string[];
}

export interface DiscoveredOffer {
  snapshot: OfferSnapshot;
  slot?: number;
}

export interface DiscoveryOptions {
  commitment?: Commitment;
  /** Max offers to return (safety). Undefined = no explicit cap. */
  maxOffers?: number;
}

export interface DiscoveryResult {
  offers: DiscoveredOffer[];
  diagnostics: string[];
  slot?: number;
  commitment: Commitment;
  truncated: boolean;
  truncationReason?: string;
}

export interface TokenAccountLookup {
  /** Valid SPL Token accounts for (owner,mint): pubkey strings. */
  accounts: TokenAccountCandidate[];
}

export type TokenAccountLookupFn = (owner: string, mint: string) => Promise<TokenAccountLookup>;

export interface ResolveAccountsOptions {
  /** If provided, resolves dest/excess roles via RPC/policy. */
  lookupTokenAccount?: TokenAccountLookupFn;
}

export interface RecheckOptions {
  connection: import("@solana/web3.js").Connection;
  commitment?: Commitment;
  nowUnixSeconds: bigint;
  /** Recheck conservative expiry precondition; on-chain remains authoritative. */
  expirySafetyBufferSeconds?: bigint;
}

/** JSON-safe serialization (pubkeys/bigints as strings). */
export interface SerializableCycleCandidate extends Omit<CycleCandidate, "offers"> {
  offers: [SerializableOfferSnapshot, SerializableOfferSnapshot, SerializableOfferSnapshot];
}

export interface SerializableOfferSnapshot {
  offer: string;
  maker: string;
  nonce: string;
  version: number;
  bump: number;
  escrowBump: number;
  status: OfferStatusName;
  offeredMint: string;
  requestedMint: string;
  offeredAmount: string;
  requestedAmount: string;
  createdAt: string;
  expiresAt: string;
}

export function serializeCandidate(c: CycleCandidate): SerializableCycleCandidate {
  return {
    ...c,
    offers: c.offers.map((o) => ({
      offer: o.offer.toBase58(),
      maker: o.maker.toBase58(),
      nonce: o.nonce.toString(),
      version: o.version,
      bump: o.bump,
      escrowBump: o.escrowBump,
      status: o.status,
      offeredMint: o.offeredMint.toBase58(),
      requestedMint: o.requestedMint.toBase58(),
      offeredAmount: o.offeredAmount.toString(),
      requestedAmount: o.requestedAmount.toString(),
      createdAt: o.createdAt.toString(),
      expiresAt: o.expiresAt.toString(),
    })) as SerializableCycleCandidate["offers"],
  };
}
