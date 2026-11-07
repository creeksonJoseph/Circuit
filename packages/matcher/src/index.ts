import type { Cycle, OfferEdge } from "./types";

export const MATCHER_VERSION = "0.1.0";

export * from "./types";

/**
 * Stage 1 scaffold.
 *
 * Cycle discovery is intentionally not implemented yet. The function exists so
 * the package has a stable entry point and so callers fail loudly rather than
 * silently receiving an empty or incorrect result.
 */
export function findCycles(_offers: readonly OfferEdge[], _now: bigint): Cycle[] {
  throw new Error("CIRCUIT matcher is not implemented in Stage 1.");
}
