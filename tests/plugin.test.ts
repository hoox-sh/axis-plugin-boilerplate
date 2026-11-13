/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "bun:test";
import { helloSource, plugin } from "../src/plugin";
import { PLUGIN_ID } from "../src/manifest";
import { assertPlugin } from "../src/helpers";

describe("helloSource", () => {
  it("matches the AXIS source contract", () => {
    const p = assertPlugin(helloSource);
    expect(p.kind).toBe("source");
    expect(p.id).toBe(PLUGIN_ID);
    expect(plugin).toBe(helloSource);
  });

  it("returns unix-second bars honoring limit and window", async () => {
    const bars = await helloSource.fetchHistorical({
      symbol: "HELLO",
      interval: "1h",
      limit: 24,
      endTime: 1_700_000_000,
      config: { seed: 42, startPrice: 100 },
    });
    expect(bars).toHaveLength(24);
    expect(bars[0]!.time).toBe(1_700_000_000 - 23 * 3600);
    expect(bars.at(-1)!.time).toBe(1_700_000_000);
    expect(bars.every((b) => b.time < 1e12)).toBe(true);
  });

  it("clamps walk-back pages with startTime", async () => {
    const bars = await helloSource.fetchHistorical({
      symbol: "HELLO",
      interval: "1h",
      limit: 500,
      startTime: 1_700_000_000 - 3 * 3600,
      endTime: 1_700_000_000,
      config: { seed: 1 },
    });
    expect(bars.length).toBeLessThanOrEqual(4);
    expect(bars[0]!.time).toBeGreaterThanOrEqual(1_700_000_000 - 3 * 3600);
  });

  it("filters searchSymbols", async () => {
    expect(await helloSource.searchSymbols?.("hel")).toEqual(["HELLO"]);
    expect(await helloSource.searchSymbols?.("")).toEqual([
      "HELLO",
      "DEMO",
      "WALK",
    ]);
  });
});
