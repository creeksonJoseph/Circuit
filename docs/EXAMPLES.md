# Integration Examples

This page describes the complete safe order of operations. The SDK and matcher
build instructions; the application wallet signs and submits them.

## 1. Prepare offers

Each maker creates an offer and deposits the offered mint into its escrow ATA.
For a cycle:

```text
A: X -> Y
B: Y -> Z
C: Z -> X
```

Create the makers' offered-token ATAs and the escrow ATAs before sending the
create instructions. See the [Python SDK](PYTHON_SDK.md) for builders.

## 2. Discover and resolve

The matcher discovers Offer accounts through RPC, finds a mathematically valid
cycle, and resolves:

- C-owned X destination;
- A-owned Y destination;
- B-owned Z destination;
- one refund account for each maker.

All six accounts must already exist and match both owner and mint. A canonical
ATA is preferred; an unambiguous valid noncanonical account may be used.

## 3. Recheck and submit

Re-read the candidate, build the settlement instruction, add it to a
transaction, and sign with the submitting wallet. Settlement is permissionless;
the caller does not need to be one of the makers.

After confirmation, verify the three destination balance deltas, terminal offer
statuses, and escrow account closures. If any leg fails, the transaction is
atomic and no transfer leg is committed.

The exact account order is documented in [Protocol](PROTOCOL.md), and the
matcher API is documented in [TypeScript Matcher](TYPESCRIPT_MATCHER.md).

---

[Documentation index](README.md) · [Protocol](PROTOCOL.md) ·
[Deployment](DEPLOYMENT.md)
