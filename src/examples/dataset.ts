/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Example **dataset** — synthetic scalar series (fake protocol TVL).
 * Install: `http://127.0.0.1:4173/examples/dataset.js`
 */

import { intervalToSec, resolveConfig } from "../helpers";
import type {
  DatasetPlugin,
  OnchainDataset,
  OnchainInstrument,
  TimePoint,
} from "../types";

const exampleDataset: DatasetPlugin = {
  id: "example-dataset",
  name: "Example Dataset",
  kind: "dataset",
  version: "0.1.0",
  description:
    "Synthetic scalar series. Replace fetchDataset with DefiLlama / your metric API.",
  capabilities: { offline: true, transport: "local" },
  configSchema: {
    points: { type: "number", default: 90, min: 7, max: 2000, label: "Points" },
    startValue: { type: "number", default: 1_000_000, label: "Start value" },
  },
  async searchInstruments(query) {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    const all: OnchainInstrument[] = [
      {
        chainId: "all",
        protocolId: "hello",
        metric: "tvl",
        symbol: "HELLO",
      },
    ];
    if (!q) return all;
    return all.filter(
      (i) =>
        i.symbol.toLowerCase().includes(q) ||
        String(i.protocolId || "").includes(q) ||
        i.metric.includes(q),
    );
  },
  async fetchDataset(opts): Promise<OnchainDataset> {
    const cfg = resolveConfig(this.configSchema, opts.config);
    const count = opts.limit || Number(cfg.points) || 90;
    const step = intervalToSec(opts.resolution || "1d");
    const end =
      typeof opts.endTime === "number" && opts.endTime > 0
        ? Math.floor(opts.endTime)
        : Math.floor(Date.now() / 1000);
    let value = Number(cfg.startValue) || 1_000_000;
    const points: TimePoint[] = [];
    for (let i = count - 1; i >= 0; i--) {
      value = Math.max(1, value * (1 + (Math.sin(i / 7) * 0.02 + 0.001)));
      points.push({ time: end - i * step, value });
    }
    const instrument = opts.instrument || {
      chainId: "all",
      protocolId: "hello",
      metric: "tvl",
      symbol: "HELLO",
    };
    return {
      id: `example-dataset:${instrument.protocolId || instrument.symbol}:${instrument.metric}`,
      kind: "scalar_series",
      instrument,
      resolution: opts.resolution || "1d",
      points,
      asOf: end,
      finality: "unknown",
      provenance: { provider: "example-dataset" },
      synthetic: true,
    };
  },
};

export default exampleDataset;
