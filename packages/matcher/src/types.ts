import type { PublicKey } from "@solana/web3.js";

/**
 * One open offer, reduced to the data the matcher needs.
 *
 * Amounts are integer base units. The matcher must never use floating point
 * arithmetic for token amounts.
 */
export interface OfferEdge {
  offer: PublicKey;
  maker: PublicKey;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  offeredAmount: bigint;
  requestedAmount: bigint;
  expiresAt: bigint;
}

/**
 * A three-party directed cycle.
 *
 * The order is A, B, C. A receives B's offered asset, B receives C's, and C
 * receives A's.
 */
export interface Cycle {
  offers: [OfferEdge, OfferEdge, OfferEdge];
}
