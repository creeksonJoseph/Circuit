# CIRCUIT — Stage Progress

| Stage | Status | Scope | Evidence |
|---|---|---|---|
| 0 | Complete | Technical discovery, dependency selection, structure proposal | `ENVIRONMENT_REPORT.md`, `TECHNICAL_PLAN.md`, `PROPOSED_DEPENDENCIES.md`, `PROPOSED_PROJECT_STRUCTURE.md` |
| 1 | Complete | Monorepo scaffold, Anchor program scaffold, local cluster, Python SDK scaffold, TypeScript matcher scaffold, React/JS frontend scaffold, lint/format/test setup | `STAGE1_REPORT.md`, `BUILD_AND_TEST.md` |
| 2 | Not started | Offer account, PDA, escrow-funded `create_offer` | — |
| 3 | Not started | Cancel and expiry refund | — |
| 4 | Not started | Atomic three-party settlement | — |
| 5 | Not started | Cycle matcher implementation | — |
| 6 | Not started | SDK implementation | — |
| 7 | Not started | React demo integration | — |
| 8 | Not started | Devnet deployment | — |
| 9 | Not started | Final security and integration review | — |

## Stage 1 decisions

- SDK language changed to **Python** at the user's request.
- Python SDK tooling uses **uv** (not pip/venv/build). `uv.lock` is committed.
- Frontend changed to **React + JavaScript/JSX** at the user's request.
- Matcher and integration tests remain TypeScript.
- `anchor test` uses `--validator legacy` because Anchor 1.2.2 defaults to
  surfpool, which is not installed.

## Verified in Stage 1

See `STAGE1_REPORT.md` for actual command output. Do not mark a stage item as
verified without rerunning the corresponding command.
