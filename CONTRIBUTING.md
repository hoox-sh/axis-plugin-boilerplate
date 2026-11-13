# Contributing

Thanks for helping with the **AXIS plugin boilerplate**.

## Sister repos

| Product  | Repo                                    | Website                              |
| -------- | --------------------------------------- | ------------------------------------ |
| **AXIS** | [axis](https://github.com/hoox-sh/axis) | [hoox.sh/axis](https://hoox.sh/axis) |
| **PYNE** | [pyne](https://github.com/hoox-sh/pyne) | [hoox.sh/pyne](https://hoox.sh/pyne) |
| **HOOX** | [hoox](https://github.com/hoox-sh/hoox) | [hoox.sh](https://hoox.sh)           |

Plugin contracts live in AXIS (`src/plugins/types.ts`). When AXIS changes a
required method, update `src/types.ts` and the examples here.

## Setup

```bash
bun install
bun test
bun run serve
```

Load `http://127.0.0.1:4173/plugin.js` from a local AXIS
(`cd ../axis && bun run dev`).

## Checks

```bash
bun run check
```

## Style

- TypeScript ESM, Bun for tests and the local server
- Conventional commits when practical: `feat`, `fix`, `docs`, `test`, `chore`
- One logical change per commit when practical

## License

AGPL-3.0-only. See [LICENSE](LICENSE).
