import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import type { AccountResolution, SettlementAccountPlan, TokenAccountRole } from "./types";

const PROGRAM_ID = new PublicKey("4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc");
const DISC = Buffer.from([171, 180, 39, 74, 141, 164, 40, 217]);
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export interface SettleCycleAccounts {
  offerA: PublicKey;
  offerB: PublicKey;
  offerC: PublicKey;
  mintX: PublicKey;
  mintY: PublicKey;
  mintZ: PublicKey;
  escrowAuthorityA: PublicKey;
  escrowAuthorityB: PublicKey;
  escrowAuthorityC: PublicKey;
  escrowAtaA: PublicKey;
  escrowAtaB: PublicKey;
  escrowAtaC: PublicKey;
  destCReceivesX: PublicKey;
  destAReceivesY: PublicKey;
  destBReceivesZ: PublicKey;
  excessRefundA: PublicKey;
  excessRefundB: PublicKey;
  excessRefundC: PublicKey;
  makerA: PublicKey;
  makerB: PublicKey;
  makerC: PublicKey;
  tokenProgram?: PublicKey;
}

const PLAN_ROLE_FIELDS: Record<TokenAccountRole, keyof SettlementAccountPlan> = {
  dest_c_receives_x: "destCReceivesX",
  dest_a_receives_y: "destAReceivesY",
  dest_b_receives_z: "destBReceivesZ",
  excess_refund_a: "excessRefundA",
  excess_refund_b: "excessRefundB",
  excess_refund_c: "excessRefundC",
};

/** Convert a fully resolved matcher plan into the exact Anchor settleCycle map. */
export function buildSettleCycleAccountMap(
  plan: SettlementAccountPlan,
  resolutions: readonly AccountResolution[],
): SettleCycleAccounts & { tokenProgram: PublicKey } {
  const expectedRoles = Object.keys(PLAN_ROLE_FIELDS) as TokenAccountRole[];
  const resolutionByRole = new Map(resolutions.map((resolution) => [resolution.role, resolution]));
  for (const role of expectedRoles) {
    const resolution = resolutionByRole.get(role);
    if (!resolution || resolution.status !== "resolved" || !resolution.selected) {
      throw new Error(`settle_cycle_account_unresolved:${role}:${resolution?.status ?? "missing"}`);
    }
  }
  for (const resolution of resolutions) {
    if (resolution.status !== "resolved" || !resolution.selected) {
      throw new Error(`settle_cycle_account_unresolved:${resolution.role}:${resolution.status}`);
    }
    const field = PLAN_ROLE_FIELDS[resolution.role];
    if (plan[field] !== resolution.selected) {
      throw new Error(`settle_cycle_account_mismatch:${resolution.role}`);
    }
  }

  const required = [
    "offerA",
    "offerB",
    "offerC",
    "mintX",
    "mintY",
    "mintZ",
    "escrowAuthorityA",
    "escrowAuthorityB",
    "escrowAuthorityC",
    "escrowAtaA",
    "escrowAtaB",
    "escrowAtaC",
    "destCReceivesX",
    "destAReceivesY",
    "destBReceivesZ",
    "excessRefundA",
    "excessRefundB",
    "excessRefundC",
    "makerA",
    "makerB",
    "makerC",
    "tokenProgram",
  ] as const;
  for (const field of required) {
    if (plan[field] === null || plan[field] === undefined || plan[field] === "") {
      throw new Error(`settle_cycle_account_unresolved:${field}`);
    }
  }

  return {
    offerA: new PublicKey(plan.offerA),
    offerB: new PublicKey(plan.offerB),
    offerC: new PublicKey(plan.offerC),
    mintX: new PublicKey(plan.mintX),
    mintY: new PublicKey(plan.mintY),
    mintZ: new PublicKey(plan.mintZ),
    escrowAuthorityA: new PublicKey(plan.escrowAuthorityA),
    escrowAuthorityB: new PublicKey(plan.escrowAuthorityB),
    escrowAuthorityC: new PublicKey(plan.escrowAuthorityC),
    escrowAtaA: new PublicKey(plan.escrowAtaA),
    escrowAtaB: new PublicKey(plan.escrowAtaB),
    escrowAtaC: new PublicKey(plan.escrowAtaC),
    destCReceivesX: new PublicKey(plan.destCReceivesX!),
    destAReceivesY: new PublicKey(plan.destAReceivesY!),
    destBReceivesZ: new PublicKey(plan.destBReceivesZ!),
    excessRefundA: new PublicKey(plan.excessRefundA!),
    excessRefundB: new PublicKey(plan.excessRefundB!),
    excessRefundC: new PublicKey(plan.excessRefundC!),
    makerA: new PublicKey(plan.makerA),
    makerB: new PublicKey(plan.makerB),
    makerC: new PublicKey(plan.makerC),
    tokenProgram: new PublicKey(plan.tokenProgram),
  };
}

export function buildSettleCycleFromPlan(
  plan: SettlementAccountPlan,
  resolutions: readonly AccountResolution[],
): TransactionInstruction {
  return buildSettleCycle(buildSettleCycleAccountMap(plan, resolutions));
}

export function buildSettleCycle(accts: SettleCycleAccounts): TransactionInstruction {
  const keys = [
    { pubkey: accts.offerA, isSigner: false, isWritable: true },
    { pubkey: accts.offerB, isSigner: false, isWritable: true },
    { pubkey: accts.offerC, isSigner: false, isWritable: true },
    { pubkey: accts.mintX, isSigner: false, isWritable: false },
    { pubkey: accts.mintY, isSigner: false, isWritable: false },
    { pubkey: accts.mintZ, isSigner: false, isWritable: false },
    { pubkey: accts.escrowAuthorityA, isSigner: false, isWritable: false },
    { pubkey: accts.escrowAuthorityB, isSigner: false, isWritable: false },
    { pubkey: accts.escrowAuthorityC, isSigner: false, isWritable: false },
    { pubkey: accts.escrowAtaA, isSigner: false, isWritable: true },
    { pubkey: accts.escrowAtaB, isSigner: false, isWritable: true },
    { pubkey: accts.escrowAtaC, isSigner: false, isWritable: true },
    { pubkey: accts.destCReceivesX, isSigner: false, isWritable: true },
    { pubkey: accts.destAReceivesY, isSigner: false, isWritable: true },
    { pubkey: accts.destBReceivesZ, isSigner: false, isWritable: true },
    { pubkey: accts.excessRefundA, isSigner: false, isWritable: true },
    { pubkey: accts.excessRefundB, isSigner: false, isWritable: true },
    { pubkey: accts.excessRefundC, isSigner: false, isWritable: true },
    { pubkey: accts.makerA, isSigner: false, isWritable: true },
    { pubkey: accts.makerB, isSigner: false, isWritable: true },
    { pubkey: accts.makerC, isSigner: false, isWritable: true },
    { pubkey: accts.tokenProgram ?? TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];
  if (keys.length !== 22) throw new Error("invalid account count");
  return new TransactionInstruction({ programId: PROGRAM_ID, keys, data: DISC });
}

/** Preserve useful phase/program information when a transaction fails. */
export function formatTransactionFailure(error: unknown, phase: string): string {
  const value = error as { message?: string; logs?: string[] };
  const message = value.message ?? String(error);
  const logs = value.logs ?? [];
  const instruction =
    message.match(/Instruction\s+(\d+)/i)?.[1] ??
    logs.join("\n").match(/Instruction\s+(\d+)/i)?.[1] ??
    "unknown";
  const programs = [
    ...logs.join("\n").matchAll(/Program\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+invoke/g),
  ]
    .map((match) => match[1])
    .filter((program, index, all) => all.indexOf(program) === index);
  return `transaction_failure:phase=${phase}:instruction=${instruction}:programs=${programs.join(",") || "unknown"}:message=${message}`;
}
