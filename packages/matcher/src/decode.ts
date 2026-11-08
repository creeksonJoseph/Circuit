import { PublicKey } from "@solana/web3.js";
import {
  CIRCUIT_PROGRAM_ID_STR,
  OFFER_ACCOUNT_SIZE,
  OFFER_DISCRIMINATOR,
  type OfferSnapshot,
  type OfferStatusName,
} from "./types";

function readU64LE(buf: Buffer, off: number): bigint {
  return buf.readBigUInt64LE(off);
}
function readI64LE(buf: Buffer, off: number): bigint {
  return buf.readBigInt64LE(off);
}
function readPk(buf: Buffer, off: number): PublicKey {
  return new PublicKey(buf.subarray(off, off + 32));
}

const STATUS_NAMES: OfferStatusName[] = ["open", "settled", "cancelled", "expired"];

export function decodeOfferAccount(
  offerPubkey: PublicKey,
  data: Buffer | Uint8Array,
  owner?: PublicKey,
): { ok: true; snapshot: OfferSnapshot } | { ok: false; reason: string } {
  if (owner && owner.toBase58() !== CIRCUIT_PROGRAM_ID_STR) {
    return { ok: false, reason: "owner_not_circuit_program" };
  }
  const buf = Buffer.from(data);
  if (buf.length < 8) return { ok: false, reason: "too_short" };
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== OFFER_DISCRIMINATOR[i]) return { ok: false, reason: "bad_discriminator" };
  }
  if (buf.length !== OFFER_ACCOUNT_SIZE) {
    // accept >= expected for forward-compat? Stage 4 fixed; be strict+safe
    if (buf.length < OFFER_ACCOUNT_SIZE) return { ok: false, reason: "wrong_size" };
  }
  try {
    let o = 8;
    const version = buf.readUInt8(o);
    o += 1;
    const bump = buf.readUInt8(o);
    o += 1;
    const escrowBump = buf.readUInt8(o);
    o += 1;
    const statusIdx = buf.readUInt8(o);
    o += 1;
    const status = STATUS_NAMES[statusIdx];
    if (!status) return { ok: false, reason: "unknown_status" };
    const maker = readPk(buf, o);
    o += 32;
    const nonce = readU64LE(buf, o);
    o += 8;
    const offeredMint = readPk(buf, o);
    o += 32;
    const requestedMint = readPk(buf, o);
    o += 32;
    const offeredAmount = readU64LE(buf, o);
    o += 8;
    const requestedAmount = readU64LE(buf, o);
    o += 8;
    const createdAt = readI64LE(buf, o);
    o += 8;
    const expiresAt = readI64LE(buf, o);
    o += 8;
    void createdAt;
    if (offeredAmount <= 0n || requestedAmount <= 0n) {
      return { ok: false, reason: "non_positive_amount" };
    }
    if (offeredMint.equals(requestedMint)) return { ok: false, reason: "same_mint" };
    return {
      ok: true,
      snapshot: {
        offer: offerPubkey,
        maker,
        nonce,
        version,
        bump,
        escrowBump,
        status,
        offeredMint,
        requestedMint,
        offeredAmount,
        requestedAmount,
        createdAt,
        expiresAt,
      },
    };
  } catch (e) {
    return { ok: false, reason: `decode_error:${String(e)}` };
  }
}
