/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Default AXIS plugin — `kind: 'source'`.
 *
 * AXIS loads this as an ES module via `import()`:
 *
 *   Manager → Plugins → Install → http://127.0.0.1:4173/plugin.js
 *
 * Replace {@link helloSource.fetchHistorical} with your venue / API.
 * Bars must use `time` in **unix seconds**.
 *
 * Namespace: `pynescript.axis.plugins.v1`
 */

import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME, PLUGIN_VERSION } from './manifest';
import { intervalToSec, resolveConfig, synthesizeWalk } from './helpers';
import type { SourceOpts, SourcePlugin } from './types';

export const helloSource: SourcePlugin = {
  id: PLUGIN_ID,
  name: PLUGIN_NAME,
  kind: 'source',
  version: PLUGIN_VERSION,
  description: PLUGIN_DESCRIPTION,
  capabilities: {
    offline: true,
    transport: 'local',
  },
  configSchema: {
    seed: {
      type: 'number',
      default: 42,
      label: 'Seed (0 = random)',
      description: 'Deterministic PRNG seed. 0 uses Math.random().',
    },
    startPrice: { type: 'number', default: 100, min: 0.01, label: 'Start price' },
    limit: { type: 'number', default: 300, min: 10, max: 10_000, label: 'Bars' },
  },
  async searchSymbols(query) {
    const q = String(query || '').trim().toUpperCase();
    const catalog = ['HELLO', 'DEMO', 'WALK'];
    if (!q) return catalog;
    return catalog.filter((s) => s.includes(q));
  },
  async fetchHistorical(opts: SourceOpts) {
    const cfg = resolveConfig(this.configSchema, opts.config);
    const requested = Number(opts.limit);
    const limit = Number.isFinite(requested) && requested > 0 ? requested : Number(cfg.limit) || 300;
    const startPrice = Number(cfg.startPrice) || 100;
    const seed = Number(cfg.seed) || 0;

    const endSec =
      typeof opts.endTime === 'number' && Number.isFinite(opts.endTime) && opts.endTime > 0
        ? Math.floor(opts.endTime)
        : Math.floor(Date.now() / 1000);

    let pageLimit = Math.max(1, Math.floor(limit));
    if (typeof opts.startTime === 'number' && Number.isFinite(opts.startTime) && opts.startTime > 0) {
      const step = intervalToSec(opts.interval);
      const spanBars = Math.floor((endSec - Math.floor(opts.startTime)) / step) + 1;
      if (spanBars > 0) pageLimit = Math.min(pageLimit, spanBars);
      if (pageLimit <= 0) return [];
    }

    return synthesizeWalk({
      count: pageLimit,
      interval: opts.interval,
      startPrice,
      endTime: endSec,
      seed,
    });
  },
};

export const plugin = helloSource;
export default helloSource;
