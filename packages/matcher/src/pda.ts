import { PublicKey } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID_STR,
  CIRCUIT_PROGRAM_ID_STR,
  TOKEN_PROGRAM_ID_STR,
} from "./types";

const OFFER_SEED = Buffer.from("offer");
const ESCROW_SEED = Buffer.from("escrow");

export function circuitProgramId(): PublicKey {
  return new PublicKey(CIRCUIT_PROGRAM_ID_STR);
}

export function tokenProgramId(): PublicKey {
  return new PublicKey(TOKEN_PROGRAM_ID_STR);
}

export function associatedTokenProgramId(): PublicKey {
  return new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID_STR);
}

export function findOfferPda(
  maker: PublicKey,
  nonce: bigint,
  programId = circuitProgramId(),
): [PublicKey, number] {
  const nonceBuf = Buffer.alloc(8);
  nonceBuf.writeBigUInt64LE(nonce);
  return PublicKey.findProgramAddressSync([OFFER_SEED, maker.toBuffer(), nonceBuf], programId);
}

export function findEscrowAuthorityPda(
  offer: PublicKey,
  programId = circuitProgramId(),
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([ESCROW_SEED, offer.toBuffer()], programId);
}

/** Canonical ATA for (owner, mint, SPL Token). allowOwnerOffCurve=true for PDAs. */
export function getCanonicalAta(
  mint: PublicKey,
  owner: PublicKey,
  _allowOwnerOffCurve = true,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), tokenProgramId().toBuffer(), mint.toBuffer()],
    associatedTokenProgramId(),
  )[0];
}
