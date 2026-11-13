/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "bun:test";
import { assertPlugin } from "../src/helpers";
import source from "../src/examples/source";
import stream from "../src/examples/stream";
import engine from "../src/examples/engine";
import dataset from "../src/examples/dataset";
import component from "../src/examples/component";
import type {
  DatasetPlugin,
  EnginePlugin,
  SourcePlugin,
  StreamPlugin,
} from "../src/types";

const bars = [
  { time: 1, open: 10, high: 11, low: 9, close: 10.5, volume: 1 },
  { time: 2, open: 10.5, high: 12, low: 10, close: 11, volume: 2 },
  { time: 3, open: 11, high: 11.5, low: 10.5, close: 11.2, volume: 3 },
];

describe("example plugins", () => {
  it("satisfy the AXIS loader contract", () => {
    expect(assertPlugin(source).kind).toBe("source");
    expect(assertPlugin(stream).kind).toBe("stream");
    expect(assertPlugin(engine).kind).toBe("engine");
    expect(assertPlugin(dataset).kind).toBe("dataset");
    expect(assertPlugin(component).kind).toBe("component");
  });

  it("source returns bars", async () => {
    const p = source as SourcePlugin;
    const out = await p.fetchHistorical({
      symbol: "X",
      interval: "1d",
      limit: 10,
    });
    expect(out.length).toBe(10);
  });

  it("stream start returns a stop function and emits status", () => {
    const p = stream as StreamPlugin;
    const states: string[] = [];
    const stop = p.start({
      symbol: "X",
      interval: "1m",
      onBar: () => {},
      onError: () => {},
      onStatus: (s) => states.push(s.state),
    });
    expect(typeof stop).toBe("function");
    expect(states[0]).toBe("open");
    stop();
    expect(states.at(-1)).toBe("closed");
  });

  it("engine plots SMA and never throws", async () => {
    const p = engine as EnginePlugin;
    expect(await p.isReady()).toBe(true);
    const ok = await p.run({ script: "", bars });
    expect(ok.status).toBe("success");
    expect(ok.plots).toHaveLength(bars.length);
    expect(ok.series?.sma).toEqual(ok.plots);
  });

  it("dataset returns a synthetic scalar series", async () => {
    const p = dataset as DatasetPlugin;
    const ds = await p.fetchDataset({
      instrument: {
        chainId: "all",
        protocolId: "hello",
        metric: "tvl",
        symbol: "HELLO",
      },
      resolution: "1d",
      limit: 12,
    });
    expect(ds.kind).toBe("scalar_series");
    expect(ds.synthetic).toBe(true);
    expect(ds.points).toHaveLength(12);
    expect(ds.provenance.provider).toBe("example-dataset");
  });

  it("component mount returns cleanup", () => {
    const el = {
      innerHTML: "x",
      textContent: "",
      append: () => {},
    } as unknown as HTMLElement;
    const stop = component.mount("manager-tab", el, {});
    expect(typeof stop).toBe("function");
    stop();
    expect(el.innerHTML).toBe("");
  });
});
