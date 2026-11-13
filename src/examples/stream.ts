/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Example **stream** — synthetic live bars (no network).
 * `start` must return a stop() that clears timers / sockets.
 * Install: `http://127.0.0.1:4173/examples/stream.js`
 */

import { intervalToSec, resolveConfig } from "../helpers";
import type { Bar, StreamPlugin } from "../types";

const exampleStream: StreamPlugin = {
  id: "example-stream",
  name: "Example Stream",
  kind: "stream",
  version: "0.1.0",
  description:
    "Synthetic poll stream. Replace start() with a WebSocket to a venue or Worker.",
  capabilities: { offline: true, transport: "local" },
  configSchema: {
    tickMs: { type: "number", default: 1000, min: 100, label: "Tick (ms)" },
    volatility: {
      type: "number",
      default: 0.005,
      min: 0,
      max: 0.5,
      label: "Volatility",
    },
  },
  start({ interval, onBar, onStatus, lastBar, config }) {
    const cfg = resolveConfig(this.configSchema, config);
    const step = intervalToSec(interval);
    const tickMs = Math.max(100, Number(cfg.tickMs) || 1000);
    const vol = Number(cfg.volatility) || 0.005;

    let stopped = false;
    let cur: Bar = lastBar
      ? { ...lastBar }
      : {
          time: Math.floor(Date.now() / 1000) - step,
          open: 100,
          high: 101,
          low: 99,
          close: 100,
          volume: 100,
        };

    onStatus({
      state: "open",
      url: "mock://example-stream",
      detail: "synthetic poll",
    });

    const handle = setInterval(() => {
      if (stopped) return;
      const now = Math.floor(Date.now() / 1000);
      const slot = Math.floor(now / step) * step;
      const drift = (Math.random() - 0.48) * cur.close * vol;
      if (slot === cur.time) {
        const close = Math.max(0.01, cur.close + drift);
        cur = {
          ...cur,
          high: Math.max(cur.high, close, cur.open),
          low: Math.min(cur.low, close, cur.open),
          close,
          volume: (cur.volume ?? 0) + Math.random() * 50,
          closed: false,
        };
      } else {
        const open = cur.close;
        const close = Math.max(0.01, open + drift);
        cur = {
          time: slot,
          open,
          high: Math.max(open, close),
          low: Math.min(open, close),
          close,
          volume: 50 + Math.random() * 200,
          closed: true,
        };
      }
      onBar(cur);
    }, tickMs);

    return () => {
      stopped = true;
      clearInterval(handle);
      onStatus({ state: "closed" });
    };
  },
};

export default exampleStream;
