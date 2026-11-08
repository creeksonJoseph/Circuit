import { type Commitment, type Connection, PublicKey } from "@solana/web3.js";
import { decodeOfferAccount } from "./decode";
import {
  CIRCUIT_PROGRAM_ID_STR,
  OFFER_DISCRIMINATOR,
  type DiscoveredOffer,
  type DiscoveryOptions,
  type DiscoveryResult,
} from "./types";
import { tokenProgramId } from "./pda";
import {
  allResolved,
  applyResolutionsToPlan,
  planRoles,
  resolveTokenAccountRole,
  type TokenAccountInfoLike,
} from "./resolve";
import type { CycleCandidate } from "./types";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function toBase58Bytes(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += (digits[j] ?? 0) << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = "";
  for (const b of bytes) {
    if (b === 0) str += ALPHABET[0];
    else break;
  }
  for (let i = digits.length - 1; i >= 0; i--) str += ALPHABET[digits[i]!] ?? "";
  return str;
}

export async function discoverOffers(
  connection: Connection,
  opts: DiscoveryOptions = {},
): Promise<DiscoveryResult> {
  const commitment: Commitment = opts.commitment ?? "confirmed";
  const programId = new PublicKey(CIRCUIT_PROGRAM_ID_STR);
  const diagnostics: string[] = [];
  const raw = await connection.getProgramAccounts(programId, {
    commitment,
    filters: [{ memcmp: { offset: 0, bytes: toBase58Bytes(OFFER_DISCRIMINATOR) } }],
    encoding: "base64",
  });
  const offers: DiscoveredOffer[] = [];
  let truncated = false;
  let truncationReason: string | undefined;
  let slot: number | undefined;
  try {
    slot = await connection.getSlot(commitment);
  } catch (e) {
    diagnostics.push(`getSlot: ${String(e)}`);
  }
  if (opts.maxOffers === 0) {
    const truncated = raw.length > 0;
    return {
      offers,
      diagnostics,
      slot,
      commitment,
      truncated,
      truncationReason: truncated ? "capped_at_0" : undefined,
    };
  }
  for (let i = 0; i < raw.length; i++) {
    const { pubkey, account } = raw[i]!;
    try {
      const tuple = account.data as unknown as [string, string];
      const b64 = Array.isArray(tuple) ? tuple[0] : (account.data as unknown as string);
      const data = Buffer.from(b64, "base64");
      const dec = decodeOfferAccount(pubkey, data, account.owner);
      if (!dec.ok) {
        diagnostics.push(`${pubkey.toBase58()}: ${dec.reason}`);
        continue;
      }
      offers.push({ snapshot: dec.snapshot, slot });
      if (opts.maxOffers !== undefined && offers.length >= opts.maxOffers) {
        truncated = i + 1 < raw.length;
        if (truncated) truncationReason = `capped_at_${opts.maxOffers}`;
        break;
      }
    } catch (e) {
      diagnostics.push(`${pubkey.toBase58()}: ${String(e)}`);
    }
  }
  return { offers, diagnostics, slot, commitment, truncated, truncationReason };
}

export async function fetchTokenAccountsForOwnerMint(
  connection: Connection,
  owner: PublicKey,
  mint?: PublicKey,
  commitment: Commitment = "confirmed",
): Promise<TokenAccountInfoLike[]> {
  // original SPL Token program only
  const res = await connection.getTokenAccountsByOwner(
    owner,
    mint ? { mint } : { programId: tokenProgramId() },
    commitment,
  );
  return res.value.map((v) => ({
    pubkey: v.pubkey,
    account: { data: Buffer.from(v.account.data), owner: v.account.owner },
  }));
}

export async function resolveCandidateAccounts(
  connection: Connection,
  candidate: CycleCandidate,
  commitment: Commitment = "confirmed",
): Promise<void> {
  const [A, B, C] = candidate.offers;
  const roles = planRoles(A, B, C);
  const resolutions = [];
  for (const spec of roles) {
    const accounts = await fetchTokenAccountsForOwnerMint(
      connection,
      spec.owner,
      spec.mint,
      commitment,
    );
    resolutions.push(
      resolveTokenAccountRole(spec.role, spec.mint, spec.owner, accounts, tokenProgramId()),
    );
  }
  candidate.accountResolutions = resolutions;
  applyResolutionsToPlan(candidate.settlementAccounts, resolutions);
  candidate.validity.accountsResolved = allResolved(resolutions);
  if (!candidate.validity.accountsResolved) {
    for (const [index, resolution] of resolutions.entries()) {
      if (resolution.status === "resolved") continue;
      const spec = roles[index]!;
      candidate.warnings.push(
        `account_resolution:${resolution.role}:phase=resolve:commitment=${commitment}:expected_owner=${spec.owner.toBase58()}:expected_mint=${spec.mint.toBase58()}:matching_accounts=${resolution.candidates?.length ?? 0}:status=${resolution.status}`,
      );
    }
  }
}
