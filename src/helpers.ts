/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AnyPlugin, Bar, ConfigSchema, PluginKind } from './types';

const INTERVAL_SEC: Record<string, number> = {
  m: 60,
  h: 3_600,
  d: 86_400,
  w: 604_800,
};

/** AXIS interval string (`1m`, `5m`, `1h`, `1d`, `1w`) → bar step in seconds. */
export function intervalToSec(interval: string): number {
  const m = /^(\d+)([mhdw])$/.exec(String(interval || '').trim());
  if (!m) return 86_400;
  const n = parseInt(m[1]!, 10);
  return Math.max(1, n * (INTERVAL_SEC[m[2]!] || 86_400));
}

/** Merge `configSchema` defaults with a runtime config bag (AXIS does this too). */
export function resolveConfig(
  schema: ConfigSchema | undefined,
  config?: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, def] of Object.entries(schema || {})) {
    out[k] = def && 'default' in def ? def.default : undefined;
  }
  for (const [k, v] of Object.entries(config || {})) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/** Coerce a loose bar (seconds or ms time) into a valid {@link Bar}, or `null`. */
export function normalizeBar(raw: unknown): Bar | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  let time = Number(o.time);
  const open = Number(o.open);
  const high = Number(o.high);
  const low = Number(o.low);
  const close = Number(o.close);
  if (![time, open, high, low, close].every(Number.isFinite)) return null;
  if (time > 1e12) time = Math.floor(time / 1000);
  else time = Math.floor(time);
  if (time <= 0) return null;
  const bar: Bar = { time, open, high, low, close };
  if (o.volume != null && Number.isFinite(Number(o.volume))) {
    bar.volume = Number(o.volume);
  }
  if (typeof o.closed === 'boolean') bar.closed = o.closed;
  return bar;
}

export function normalizeBars(rows: unknown[]): Bar[] {
  const out: Bar[] = [];
  for (const row of rows) {
    const bar = normalizeBar(row);
    if (bar) out.push(bar);
  }
  return out;
}

/** Mulberry32 — small deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WalkOpts {
  count: number;
  interval: string;
  startPrice: number;
  endTime?: number;
  seed?: number;
}

/** Synthetic OHLCV random walk. `time` is unix seconds, newest bar at `endTime`. */
export function synthesizeWalk(opts: WalkOpts): Bar[] {
  const count = Math.max(1, Math.floor(opts.count));
  const step = intervalToSec(opts.interval);
  const endSec =
    typeof opts.endTime === 'number' && Number.isFinite(opts.endTime) && opts.endTime > 0
      ? Math.floor(opts.endTime)
      : Math.floor(Date.now() / 1000);
  const rand = opts.seed && opts.seed > 0 ? mulberry32(opts.seed) : Math.random;
  const out: Bar[] = [];
  let price = opts.startPrice > 0 ? opts.startPrice : 100;
  for (let i = count - 1; i >= 0; i--) {
    const time = endSec - i * step;
    const drift = (rand() - 0.48) * price * 0.02;
    const open = price;
    const close = Math.max(0.01, price + drift);
    const high = Math.max(open, close) + rand() * price * 0.005;
    const low = Math.min(open, close) - rand() * price * 0.005;
    out.push({
      time,
      open,
      high,
      low,
      close,
      volume: 100 + rand() * 1000,
    });
    price = close;
  }
  return out;
}

const KINDS: readonly PluginKind[] = [
  'source',
  'stream',
  'engine',
  'storage',
  'dataset',
  'component',
];

function asPlugin(mod: unknown): Record<string, unknown> | null {
  if (!mod || typeof mod !== 'object') return null;
  const m = mod as Record<string, unknown>;
  const p = (m.default || m.plugin || m) as Record<string, unknown>;
  if (!p || typeof p !== 'object') return null;
  return p;
}

/**
 * Assert the same required surface AXIS `loadPluginFromUrl` / the registry check.
 * Throws on contract violations. Storage is valid as an object but AXIS will
 * reject URL install of `kind: 'storage'`.
 */
export function assertPlugin(mod: unknown): AnyPlugin {
  const p = asPlugin(mod);
  if (!p) throw new Error('Module did not export a plugin object');

  const id = String(p.id || '').trim();
  const name = String(p.name || id).trim();
  const kind = String(p.kind || '').trim() as PluginKind;

  if (!id || !kind) throw new Error('Plugin needs id and kind');
  if (!name) throw new Error('Plugin needs a name');
  if (!KINDS.includes(kind)) throw new Error(`Unknown plugin kind: ${kind}`);

  if (kind === 'source' && typeof p.fetchHistorical !== 'function') {
    throw new Error('Source plugin needs fetchHistorical()');
  }
  if (kind === 'stream' && typeof p.start !== 'function') {
    throw new Error('Stream plugin needs start()');
  }
  if (kind === 'engine' && typeof p.run !== 'function') {
    throw new Error('Engine plugin needs run()');
  }
  if (kind === 'dataset' && typeof p.fetchDataset !== 'function') {
    throw new Error('Dataset plugin needs fetchDataset()');
  }
  if (kind === 'component' && typeof p.mount !== 'function') {
    throw new Error('Component plugin needs mount()');
  }
  if (kind === 'storage') {
    for (const method of ['list', 'read', 'write', 'remove'] as const) {
      if (typeof p[method] !== 'function') {
        throw new Error(`Storage plugin needs ${method}()`);
      }
    }
  }

  return p as unknown as AnyPlugin;
}
