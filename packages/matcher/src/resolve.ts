import { PublicKey } from "@solana/web3.js";
import type {
  AccountResolution,
  SettlementAccountPlan,
  TokenAccountCandidate,
  TokenAccountRole,
} from "./types";
import { getCanonicalAta } from "./pda";

/** Minimal SPL Token account layout offsets (165 bytes): mint[0..32), owner[32..64). */
export function parseSplTokenAccountOwnerMint(
  data: Buffer | Uint8Array,
): { mint: string; owner: string } | null {
  const buf = Buffer.from(data);
  if (buf.length < 64) return null;
  const mint = new PublicKey(buf.subarray(0, 32)).toBase58();
  const owner = new PublicKey(buf.subarray(32, 64)).toBase58();
  return { mint, owner };
}

export interface TokenAccountInfoLike {
  pubkey: PublicKey;
  account: { data: Buffer | Uint8Array; owner: PublicKey };
}

/**
 * Resolve one dest/excess role per approved policy.
 * Never creates accounts. Never selects by balance.
 */
export function resolveTokenAccountRole(
  role: TokenAccountRole,
  expectedMint: PublicKey,
  expectedOwner: PublicKey,
  accounts: TokenAccountInfoLike[],
  tokenProgramId: PublicKey,
): AccountResolution {
  const canonical = getCanonicalAta(expectedMint, expectedOwner, false);
  const valid: TokenAccountCandidate[] = [];
  for (const { pubkey, account } of accounts) {
    if (!account.owner.equals(tokenProgramId)) continue;
    const parsed = parseSplTokenAccountOwnerMint(account.data);
    if (!parsed) continue;
    if (parsed.mint !== expectedMint.toBase58()) continue;
    if (parsed.owner !== expectedOwner.toBase58()) continue;
    valid.push({ pubkey: pubkey.toBase58(), isCanonicalAta: pubkey.equals(canonical) });
  }
  // Prefer canonical ATA if present and valid.
  const canon = valid.find((v) => v.isCanonicalAta);
  if (canon) {
    return { role, status: "resolved", selected: canon.pubkey, candidates: valid };
  }
  // Exactly one valid noncanonical -> select it.
  if (valid.length === 1) {
    return { role, status: "resolved", selected: valid[0]!.pubkey, candidates: valid };
  }
  // Multiple valid noncanonical -> ambiguous, downstream selection required.
  if (valid.length > 1) {
    const sorted = [...valid].sort((a, b) => a.pubkey.localeCompare(b.pubkey));
    return {
      role,
      status: "ambiguous",
      candidates: sorted,
      reason: "multiple_valid_noncanonical_accounts; downstream_selection_required",
    };
  }
  return { role, status: "missing", reason: "no_valid_spl_token_account" };
}

export type RoleSpec = { role: TokenAccountRole; mint: PublicKey; owner: PublicKey };

export function planRoles(
  a: { maker: PublicKey; offeredMint: PublicKey },
  b: { maker: PublicKey; offeredMint: PublicKey },
  c: { maker: PublicKey; offeredMint: PublicKey },
): RoleSpec[] {
  return [
    { role: "dest_c_receives_x", mint: a.offeredMint, owner: c.maker },
    { role: "dest_a_receives_y", mint: b.offeredMint, owner: a.maker },
    { role: "dest_b_receives_z", mint: c.offeredMint, owner: b.maker },
    { role: "excess_refund_a", mint: a.offeredMint, owner: a.maker },
    { role: "excess_refund_b", mint: b.offeredMint, owner: b.maker },
    { role: "excess_refund_c", mint: c.offeredMint, owner: c.maker },
  ];
}

export function applyResolutionsToPlan(
  plan: SettlementAccountPlan,
  resolutions: AccountResolution[],
): void {
  for (const r of resolutions) {
    const val = r.status === "resolved" ? (r.selected ?? null) : null;
    switch (r.role) {
      case "dest_c_receives_x":
        plan.destCReceivesX = val;
        break;
      case "dest_a_receives_y":
        plan.destAReceivesY = val;
        break;
      case "dest_b_receives_z":
        plan.destBReceivesZ = val;
        break;
      case "excess_refund_a":
        plan.excessRefundA = val;
        break;
      case "excess_refund_b":
        plan.excessRefundB = val;
        break;
      case "excess_refund_c":
        plan.excessRefundC = val;
        break;
    }
  }
}

export function allResolved(resolutions: AccountResolution[]): boolean {
  return resolutions.every((r) => r.status === "resolved" && !!r.selected);
}
