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
      "name": "initialize",
      "docs": [
        "Initialises the single protocol configuration PDA.",
        "",
        "This is a build/test gate for Stage 1. It does not implement offers,",
        "escrow, settlement, or matching."
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
    }
  ],
  "types": [
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
