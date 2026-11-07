
export const CircuitErrorCode = {
  Uninitialized: 6000,
  ZeroOfferedAmount: 6001,
  ZeroRequestedAmount: 6002,
  SameMint: 6003,
  PastExpiry: 6004,
  InsufficientBalance: 6005
};

export type CircuitErrorName = keyof typeof CircuitErrorCode;
