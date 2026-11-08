# Troubleshooting

## Build or dependency failures

Run `npm install` from the repository root. For the SDK, run `uv sync
--locked` inside `packages/sdk`. Do not replace the committed lockfiles or use
`pip` for SDK setup.

## No cycle found

Confirm that three offers form a directed rotation, requested and offered
amounts are equal in base units, all makers are distinct, and the offers are
open and unexpired. The matcher applies an optional expiry safety buffer.

## `no_valid_spl_token_account`

Settlement does not create destination or refund accounts. Check that the
expected owner/mint pair exists under the original SPL Token Program, that the
RPC commitment can see the account, and that multiple noncanonical accounts are
not creating ambiguity. See [Protocol](PROTOCOL.md) for the six roles.

## Recheck failure

`recheckCandidateState` is a non-atomic preflight. Re-discover the candidate
after cancellation, expiry, or another state change. The Rust program may still
reject a transaction after a successful preflight if state changes before
execution.

## Transaction failure

Use the matcher’s `formatTransactionFailure` diagnostic to record the phase,
instruction index, invoked program IDs, and RPC error logs. Check the original
SPL Token program, all 22 account positions, and writable flags before
resubmitting.

## Local validator

The integration suite requires a built program and a running validator. Do not
reset or delete an existing ledger without authorization. If startup is slow,
inspect validator logs and configured startup waits first.

---

[Documentation index](README.md) · [Getting Started](GETTING_STARTED.md) ·
[TypeScript Matcher](TYPESCRIPT_MATCHER.md)
