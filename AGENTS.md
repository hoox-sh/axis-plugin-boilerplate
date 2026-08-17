# AGENTS.md — axis-plugin-boilerplate

Compact guide for AI agents working in this repo.

## What this is

Starter template for **AXIS** plugins (`pynescript.axis.plugins.v1`). AXIS
dynamic-imports an ES module from a URL and registers `source` / `stream` /
`engine` / `dataset` / `component`. Storage via URL is rejected.

Sister repo (read contracts from here, do not invent them):

- `/home/jango/Git/axis` — `src/plugins/types.ts`, `src/plugins/loader.ts`

## Commands

```bash
bun install
bun test
bun run typecheck
bun run build
bun run serve            # http://127.0.0.1:4173/plugin.js
bun run check
```

## Layout

| Path | Role |
|------|------|
| `src/manifest.ts` | Plugin id / name / version |
| `src/plugin.ts` | Default `source` (Hello Source) |
| `src/types.ts` | Vendored AXIS contracts |
| `src/helpers.ts` | `assertPlugin`, bars, interval, config |
| `src/examples/` | One file per loadable kind |
| `public/` | Built ESM + CORS `_headers` + index |
| `scripts/` | build / serve / check-contract |

## Hard constraints

- **Do not commit** `node_modules/`, `.env`, coverage, or wrangler state.
- License headers / SPDX: **AGPL-3.0-only**, author **jango_blockchained**.
- `Bar.time` is unix **seconds**, never milliseconds.
- Engine `run` must return `status: 'error'` for script failures — do not throw.
- Stream `start` **must** return a stop function that clears timers / sockets.
- Do not add a URL-installable `storage` plugin (AXIS rejects it).
- Do not claim TradingView® affiliation. Pine Script™ / TradingView® / Cloudflare® marks stay in disclaimers only.
- Keep `src/types.ts` aligned with `axis/src/plugins/types.ts` — do not invent host APIs.

## When forking for a real plugin

1. Edit `src/manifest.ts`.
2. Replace `src/plugin.ts` with the target kind (copy from `src/examples/` if needed).
3. Keep `export default` + `export const plugin`.
4. `bun run check`.
5. Serve with CORS. Production AXIS needs the host on `VITE_PLUGIN_REMOTE_ALLOW` (or same-origin `/plugins/`).
