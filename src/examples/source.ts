/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Example **source** — same contract as `src/plugin.ts`.
 * Install: `http://127.0.0.1:4173/examples/source.js`
 */

import { resolveConfig, synthesizeWalk } from "../helpers";
import type { SourcePlugin } from "../types";

const exampleSource: SourcePlugin = {
  id: "example-source",
  name: "Example Source",
  kind: "source",
  version: "0.1.0",
  description:
    "Copy-paste starter: synthetic OHLCV. Swap fetchHistorical for a venue API.",
  capabilities: { offline: true, transport: "local" },
  configSchema: {
    startPrice: { type: "number", default: 50, label: "Start price" },
    limit: { type: "number", default: 200, min: 10, max: 5000, label: "Bars" },
  },
  async fetchHistorical({ interval, limit, endTime, config }) {
    const cfg = resolveConfig(this.configSchema, config);
    const count = limit || Number(cfg.limit) || 200;
    return synthesizeWalk({
      count,
      interval,
      startPrice: Number(cfg.startPrice) || 50,
      endTime,
      seed: 7,
    });
  },
};

export default exampleSource;
