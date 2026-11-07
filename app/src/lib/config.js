const DEFAULT_RPC_URL = "http://127.0.0.1:8899";
const DEFAULT_PROGRAM_ID = "4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc";
const DEFAULT_CLUSTER = "localnet";

export const APP_NAME = "CIRCUIT";

export const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL ?? DEFAULT_RPC_URL;
export const PROGRAM_ID = import.meta.env.VITE_CIRCUIT_PROGRAM_ID ?? DEFAULT_PROGRAM_ID;
export const CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER ?? DEFAULT_CLUSTER;
