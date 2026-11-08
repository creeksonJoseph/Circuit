# CIRCUIT TypeScript Matcher

The matcher discovers offers, finds directed three-party cycles, resolves
existing SPL token accounts, rechecks live state, and constructs the
`settle_cycle` instruction. It is untrusted and never signs transactions.

Read the [TypeScript Matcher guide](../../docs/TYPESCRIPT_MATCHER.md), then
review the [protocol settlement accounts](../../docs/PROTOCOL.md).

```bash
npm run build -w @circuit/matcher
npm run typecheck -w @circuit/matcher
npm run test -w @circuit/matcher
```
