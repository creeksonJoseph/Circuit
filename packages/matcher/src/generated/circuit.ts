/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/circuit.json`.
 */
export type Circuit = {
  "address": "4Jr3Ptxa7ZnnbYpNcuPDS5AGswBQpGgyqzBHU3h1PNhc",
  "metadata": {
    "name": "circuit",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "CIRCUIT — universal multi-party asset exchange protocol"
  },
  "instructions": [
    {
      "name": "createOffer",
      "docs": [
        "Creates an offer and escrows the maker's offered tokens."
      ],
      "discriminator": [
        237,
        233,
        192,
        168,
        248,
        7,
        249,
        241
      ],
      "accounts": [
        {
          "name": "maker",
          "writable": true,
          "signer": true
        },
        {
          "name": "offer",
          "docs": [
            "Offer PDA is declared before `escrow_authority` so `offer.key()` is available",
            "for the escrow authority PDA seeds."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "offeredMint"
        },
        {
          "name": "requestedMint"
        },
        {
          "name": "makerOfferedAta",
          "writable": true
        },
        {
          "name": "escrowAuthority",
          "docs": [
            "Anchor seeds + bump constraints; not initialized and has no allocated account/owner."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "offer"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrowAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "offeredMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "offeredAmount",
          "type": "u64"
        },
        {
          "name": "requestedAmount",
          "type": "u64"
        },
        {
          "name": "expiresAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialises the single protocol configuration PDA."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "offer",
      "discriminator": [
        215,
        88,
        60,
        71,
        170,
        162,
        73,
        229
      ]
    },
    {
      "name": "protocolConfig",
      "discriminator": [
        207,
        91,
        250,
        28,
        152,
        179,
        215,
        209
      ]
    }
  ],
  "events": [
    {
      "name": "offerCreated",
      "discriminator": [
        31,
        236,
        215,
        144,
        75,
        45,
        157,
        87
      ]
    },
    {
      "name": "protocolInitialized",
      "discriminator": [
        173,
        122,
        168,
        254,
        9,
        118,
        76,
        132
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "uninitialized",
      "msg": "The protocol configuration account is not initialised"
    },
    {
      "code": 6001,
      "name": "zeroOfferedAmount",
      "msg": "The offered amount must be greater than zero"
    },
    {
      "code": 6002,
      "name": "zeroRequestedAmount",
      "msg": "The requested amount must be greater than zero"
    },
    {
      "code": 6003,
      "name": "sameMint",
      "msg": "Offered and requested mints must differ"
    },
    {
      "code": 6004,
      "name": "pastExpiry",
      "msg": "The expiry must be in the future"
    },
    {
      "code": 6005,
      "name": "insufficientBalance",
      "msg": "The maker's token account has insufficient balance"
    }
  ],
  "types": [
    {
      "name": "offer",
      "docs": [
        "A persistent offer that escrows the maker's offered tokens until settled,",
        "cancelled, or expired."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "escrowBump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "offerStatus"
              }
            }
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "offeredMint",
            "type": "pubkey"
          },
          {
            "name": "requestedMint",
            "type": "pubkey"
          },
          {
            "name": "offeredAmount",
            "type": "u64"
          },
          {
            "name": "requestedAmount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "offerCreated",
      "docs": [
        "Emitted when a maker creates an offer and deposits tokens into escrow."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offer",
            "type": "pubkey"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "offeredMint",
            "type": "pubkey"
          },
          {
            "name": "requestedMint",
            "type": "pubkey"
          },
          {
            "name": "offeredAmount",
            "type": "u64"
          },
          {
            "name": "requestedAmount",
            "type": "u64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "offerStatus",
      "docs": [
        "Lifecycle status for an offer. Only `Open` is used in Stage 2."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "settled"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "protocolConfig",
      "docs": [
        "Protocol-level configuration.",
        "",
        "Stage 1 only stores a layout version and the canonical PDA bump. Future",
        "stages may add fields through an explicit, reviewed migration."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "protocolInitialized",
      "docs": [
        "Emitted once when the protocol configuration PDA is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
