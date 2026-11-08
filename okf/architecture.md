---
type: Reference
title: Architecture
description: The project shape and the OpenOrchestrate team.
tags: [architecture, openorchestrate]
status: stable
---

# Architecture

@hoox-sh/axis-plugin-boilerplate uses OpenOrchestrate. Languages: TypeScript, JavaScript.

## Runtime surfaces

Starter for AXIS plugins — source, stream, engine, dataset, and component
kinds. Ships one offline "Hello Source" and an ES module that AXIS installs
from a URL under the `pynescript.axis.plugins.v1` contract.

- **Entry points:** the plugin module under `src/`; `src/examples/` covers every
  kind the dynamic loader accepts.
- **Run:** `bun run dev` (or `bun run serve`) for a local harness,
  `bun run build` to produce the distributable bundle.
- **Verify:** `./scripts/verify.sh` runs `bun fmt --check`,
  `bun run typecheck`, and `bun run test`.

## The team

| Seat        | Title               | Agent        |
| ----------- | ------------------- | ------------ |
| Chief       | Chief of Staff      | `oo-chief`   |
| Ops         | Head of Operations  | `oo-ops`     |
| Checker     | Quality Gate        | `oo-checker` |
| Product     | Head of Product     | `oo-spec-1`  |
| Engineering | Head of Engineering | `oo-spec-2`  |
| Misc        | General Desk        | `oo-misc`    |

## The board

The board lives at `.openorchestrate/board.md`. It has five statuses:
Todo, Working, Blocked, Ready for Review, Done. A card moves to Done only with proof.

## Related

- [Development](development.md)
- [Security](security.md)
