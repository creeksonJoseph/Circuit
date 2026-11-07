
export const CircuitErrorCode = {
  Uninitialized: 6000,
  ZeroOfferedAmount: 6001,
  ZeroRequestedAmount: 6002,
  SameMint: 6003,
  PastExpiry: 6004,
  InsufficientBalance: 6005,
  NotMaker: 6006,
  OfferNotOpen: 6007,
  NotExpired: 6008
};

export type CircuitErrorName = keyof typeof CircuitErrorCode;
