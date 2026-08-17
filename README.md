# AXIS plugin boilerplate

**AXIS plugin boilerplate** — starter for source, stream, engine, dataset, and
component plugins.

**Website:** [hoox.sh/axis](https://hoox.sh/axis) ·
**Docs:** [hoox.sh/axis/docs/plugins](https://hoox.sh/axis/docs/plugins) ·
**Repo:** [hoox-sh/axis-plugin-boilerplate](https://github.com/hoox-sh/axis-plugin-boilerplate)

Use this GitHub **template** to ship an ES module AXIS can install from URL
(`pynescript.axis.plugins.v1`). The default plugin is an offline **Hello Source**;
`src/examples/` covers every kind the dynamic loader accepts.

Part of the **[HOOX](https://hoox.sh)** open trading stack:

| Product | Role | Repo |
|---------|------|------|
| **HOOX** | Edge trading framework | [hoox-sh/hoox](https://github.com/hoox-sh/hoox) |
| **PYNE** | Pine Script™ toolchain + Pro API | [hoox-sh/pyne](https://github.com/hoox-sh/pyne) |
| **AXIS** | Charting PWA (host) | [hoox-sh/axis](https://github.com/hoox-sh/axis) |
| **This repo** | Plugin starter (source / stream / engine / dataset / component) | [hoox-sh/axis-plugin-boilerplate](https://github.com/hoox-sh/axis-plugin-boilerplate) |
| **pyne-agent-worker** | NL → PYNE component plugin | [hoox-sh/pyne-agent-worker](https://github.com/hoox-sh/pyne-agent-worker) |

**Docs:** [Plugin contracts](https://hoox.sh/axis/docs/plugins/contracts) ·
[Dynamic loader](https://hoox.sh/axis/docs/plugins/dynamic-loader) ·
[Plugin examples](https://hoox.sh/axis/docs/reference/plugin-examples)

Pine Script™ and TradingView® are trademarks of TradingView, Inc. Cloudflare®
is a registered trademark of Cloudflare, Inc. This project is independent and
is **not** affiliated with, endorsed by, or sponsored by TradingView, Inc. or
Cloudflare, Inc.

## Quick start

```bash
bun install
bun run serve          # http://127.0.0.1:4173/plugin.js
```

1. Run AXIS (`cd ../axis && bun run dev` → `http://127.0.0.1:3000`).
2. Open **Manager → Plugins → Install**.
3. Paste:

   ```
   http://127.0.0.1:4173/plugin.js
   ```

4. Click **Load**. **Hello Source** appears in the source picker.

Installed URLs persist in `localStorage` under `pynescript.axis.plugins.v1`
and restore on the next visit.

### Fork checklist

1. Change identity in `src/manifest.ts` (`id`, `name`, `version`).
2. Implement your kind in `src/plugin.ts` (or copy an example from `src/examples/`).
3. `bun test` and `bun run serve`.
4. Host the built ESM somewhere AXIS can `import()` (CORS required).

## Plugin kinds

| Kind | Required surface | URL install |
| --- | --- | --- |
| `source` | `fetchHistorical(opts) → Bar[]` | yes |
| `stream` | `start(opts) → stop()` | yes |
| `engine` | `isReady()`, `run(opts) → RunResult` | yes |
| `dataset` | `fetchDataset(opts) → OnchainDataset` | yes |
| `component` | `slots`, `mount(slot, el, api) → unmount` | yes |
| `storage` | `list` / `read` / `write` / `remove` | **rejected** — use built-in `local` / `cloud` / `git` |

`Bar.time` is **unix seconds**. Engine script errors should return
`status: 'error'` rather than throw.

This repo:

| URL | id | kind |
| --- | --- | --- |
| `/plugin.js` | `hello-source` | source (default) |
| `/examples/source.js` | `example-source` | source |
| `/examples/stream.js` | `example-stream` | stream |
| `/examples/engine.js` | `example-engine` | engine |
| `/examples/dataset.js` | `example-dataset` | dataset |
| `/examples/component.js` | `example-component` | component |

## Export shape

AXIS `loadPluginFromUrl` accepts any of:

```js
export default plugin;
export const plugin = { id, name, kind, /* … */ };
// or the module namespace itself
```

The object must include `id` and `kind`, plus the method for that kind.

```ts
export default {
  id: 'my-source',
  name: 'My Source',
  kind: 'source',
  description: 'Shown in Manager',
  capabilities: { needsNetwork: true, transport: 'rest' },
  configSchema: {
    baseUrl: { type: 'string', default: 'https://example.com', label: 'Base URL' },
  },
  async fetchHistorical({ symbol, interval, limit, startTime, endTime, signal, config }) {
    // return [{ time /* unix sec */, open, high, low, close, volume? }]
    return [];
  },
};
```

`config` is the Settings bag for this plugin (`pluginKey(kind, id)` →
`source:my-source`). Merge `configSchema` defaults yourself — AXIS does the same
in catalogs.

## CORS and production allowlist

The plugin **module URL** must allow dynamic `import()`:

- `Access-Control-Allow-Origin` (this server sends `*`)
- JavaScript MIME (`text/javascript` / `application/javascript`)

A third-party API your plugin calls is a **separate** CORS problem. Options:
same-origin proxy (AXIS Worker `/api/onchain` or your own), a key that allows
browser origins, or stay offline.

AXIS **production** builds default-deny remote plugin hosts. Dev (Vite) is open
after scheme checks.

| How you host | What AXIS needs |
| --- | --- |
| Same-origin `/plugins/….js` in the AXIS PWA | nothing — preferred for prod |
| This boilerplate on localhost | works in `bun run dev` |
| Cloudflare Pages / any https host | add the host to AXIS `VITE_PLUGIN_REMOTE_ALLOW`, or set `VITE_ALLOW_REMOTE_PLUGINS=1` |

Dangerous schemes (`javascript:`, `vbscript:`, HTML `data:`) are rejected.
Treat plugin URLs as **executable code**.

## Commands

```bash
bun install
bun test                 # contract + helpers + examples
bun run typecheck
bun run build            # src/ → public/*.js
bun run serve            # CORS static server :4173
bun run check            # build + typecheck + test + built-module contract
```

Deploy the `public/` folder anywhere static:

```bash
bun run build
npx wrangler pages deploy public --project-name=axis-plugin-boilerplate
```

`public/_headers` sets CORS for Cloudflare Pages.

## Layout

```
src/plugin.ts           default plugin (source)
src/manifest.ts         id / name / version — change first
src/types.ts            vendored AXIS contracts
src/helpers.ts          interval, config merge, walk, assertPlugin
src/examples/           source · stream · engine · dataset · component
scripts/build.ts        bun bundle → public/
scripts/serve.ts        CORS static server
scripts/check-contract.ts
public/plugin.js        built ESM AXIS imports
tests/
```

Contracts here are a snapshot of `axis/src/plugins/types.ts`. When AXIS adds
fields, update `src/types.ts` and keep this README in sync.

## Legal

AGPL-3.0-only. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
