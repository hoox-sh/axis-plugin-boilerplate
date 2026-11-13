/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Example **engine** — plots SMA of close. Not a Pine runtime.
 * `run` should return `status: 'error'` instead of throwing for script errors.
 * Install: `http://127.0.0.1:4173/examples/engine.js`
 */

import { resolveConfig } from "../helpers";
import type { EnginePlugin, RunResult } from "../types";

function sma(values: number[], period: number): (number | null)[] {
  const n = Math.max(1, Math.floor(period));
  const out: (number | null)[] = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!;
    if (i >= n) sum -= values[i - n]!;
    if (i + 1 >= n) out[i] = sum / n;
  }
  return out;
}

const exampleEngine: EnginePlugin = {
  id: "example-engine",
  name: "Example Engine",
  kind: "engine",
  version: "0.1.0",
  description: "Offline SMA(close) engine. Replace run() with your evaluator.",
  capabilities: { offline: true, transport: "local" },
  configSchema: {
    period: {
      type: "number",
      default: 14,
      min: 1,
      max: 500,
      label: "SMA period",
    },
  },
  async isReady() {
    return true;
  },
  async run({ bars, config, signal }): Promise<RunResult> {
    const t0 =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
      if (signal?.aborted) {
        return { status: "error", plots: [], events: [], error: "aborted" };
      }
      const cfg = resolveConfig(this.configSchema, config);
      const period = Number(cfg.period) || 14;
      const close = bars.map((b) => b.close);
      const plots = sma(close, period);
      return {
        status: "success",
        plots,
        series: { sma: plots },
        events: [],
        meta: {
          mode: "example-sma",
          count: bars.length,
          ms:
            (typeof performance !== "undefined"
              ? performance.now()
              : Date.now()) - t0,
          overlay: true,
          script_name: "Example SMA",
          transport: "local",
        },
      };
    } catch (err) {
      return {
        status: "error",
        plots: [],
        events: [],
        error: err instanceof Error ? err.message : String(err),
        meta: {
          ms:
            (typeof performance !== "undefined"
              ? performance.now()
              : Date.now()) - t0,
        },
      };
    }
  },
};

export default exampleEngine;
