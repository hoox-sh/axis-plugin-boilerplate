/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "bun:test";
import {
  assertPlugin,
  intervalToSec,
  mulberry32,
  normalizeBar,
  normalizeBars,
  resolveConfig,
  synthesizeWalk,
} from "../src/helpers";

describe("intervalToSec", () => {
  it("parses AXIS interval tokens", () => {
    expect(intervalToSec("1m")).toBe(60);
    expect(intervalToSec("5m")).toBe(300);
    expect(intervalToSec("1h")).toBe(3600);
    expect(intervalToSec("1d")).toBe(86_400);
    expect(intervalToSec("1w")).toBe(604_800);
  });

  it("defaults unknown to 1d", () => {
    expect(intervalToSec("")).toBe(86_400);
    expect(intervalToSec("nope")).toBe(86_400);
  });
});

describe("resolveConfig", () => {
  it("merges schema defaults with overrides", () => {
    const schema = {
      seed: { type: "number" as const, default: 42 },
      label: { type: "string" as const, default: "x" },
    };
    expect(resolveConfig(schema, { seed: 1 })).toEqual({ seed: 1, label: "x" });
  });
});

describe("normalizeBar", () => {
  it("accepts unix seconds and drops poison candles", () => {
    expect(
      normalizeBar({
        time: 1_700_000_000,
        open: 1,
        high: 2,
        low: 0.5,
        close: 1.5,
        volume: 9,
      }),
    ).toEqual({
      time: 1_700_000_000,
      open: 1,
      high: 2,
      low: 0.5,
      close: 1.5,
      volume: 9,
    });
    expect(
      normalizeBar({
        time: 1_700_000_000_000,
        open: 1,
        high: 1,
        low: 1,
        close: 1,
      })?.time,
    ).toBe(1_700_000_000);
    expect(
      normalizeBar({ time: 1, open: NaN, high: 1, low: 1, close: 1 }),
    ).toBeNull();
  });

  it("filters arrays", () => {
    expect(
      normalizeBars([
        { time: 1, open: 1, high: 1, low: 1, close: 1 },
        { time: 0 },
      ]),
    ).toHaveLength(1);
  });
});

describe("synthesizeWalk", () => {
  it("is deterministic for a seed and uses unix-second times", () => {
    const a = synthesizeWalk({
      count: 20,
      interval: "1h",
      startPrice: 100,
      endTime: 1_700_000_000,
      seed: 42,
    });
    const b = synthesizeWalk({
      count: 20,
      interval: "1h",
      startPrice: 100,
      endTime: 1_700_000_000,
      seed: 42,
    });
    expect(a).toEqual(b);
    expect(a).toHaveLength(20);
    expect(a[0]!.time).toBe(1_700_000_000 - 19 * 3600);
    expect(a.at(-1)!.time).toBe(1_700_000_000);
    for (const bar of a) {
      expect(bar.high).toBeGreaterThanOrEqual(Math.max(bar.open, bar.close));
      expect(bar.low).toBeLessThanOrEqual(Math.min(bar.open, bar.close));
    }
  });

  it("mulberry32 is stable", () => {
    expect(mulberry32(1)()).toBeGreaterThanOrEqual(0);
    expect(mulberry32(1)()).toBeLessThan(1);
  });
});

describe("assertPlugin", () => {
  it("accepts default / plugin / namespace exports", () => {
    const src = {
      id: "x",
      name: "X",
      kind: "source",
      fetchHistorical: async () => [],
    };
    expect(assertPlugin({ default: src }).id).toBe("x");
    expect(assertPlugin({ plugin: src }).id).toBe("x");
    expect(assertPlugin(src).id).toBe("x");
  });

  it("rejects incomplete plugins", () => {
    expect(() => assertPlugin({})).toThrow(/id and kind|export/i);
    expect(() => assertPlugin({ id: "a", name: "A", kind: "source" })).toThrow(
      /fetchHistorical/,
    );
    expect(() => assertPlugin({ id: "a", name: "A", kind: "nope" })).toThrow(
      /Unknown plugin kind/,
    );
    expect(() =>
      assertPlugin({ id: "s", name: "S", kind: "storage", list: () => [] }),
    ).toThrow(/read/);
  });
});
