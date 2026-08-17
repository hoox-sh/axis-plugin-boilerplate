/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Vendored AXIS plugin contracts (`pynescript.axis.plugins.v1`).
 *
 * Keep this file aligned with `axis/src/plugins/types.ts` (and the on-chain
 * dataset shapes in `axis/src/onchain/types.ts`). The AXIS dynamic loader
 * (`src/plugins/loader.ts`) accepts `export default`, `export const plugin`,
 * or a module namespace that *is* the plugin object.
 *
 * Storage plugins cannot be installed from URL yet — use built-in
 * `local` / `cloud` / `git` in AXIS.
 */

/** Discriminant for registry maps and Settings UI. */
export type PluginKind =
  | 'source'
  | 'stream'
  | 'engine'
  | 'storage'
  | 'dataset'
  | 'component';

/** One settings field in a plugin `configSchema`. */
export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'select';
  default?: string | number | boolean;
  label?: string;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

/** Map of field id → schema; defaults merged at call sites. */
export type ConfigSchema = Record<string, FieldSchema>;

/** Capability flags for Connection HUD / offline gating. */
export interface PluginCapabilities {
  offline?: boolean;
  needsAuth?: boolean;
  needsNetwork?: boolean;
  needsProxy?: boolean;
  /** Optional transport hint for Connection HUD (else inferred from id). */
  transport?: 'ws' | 'rest' | 'local' | 'broker';
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'ok' | string;

/** Shared fields on every plugin kind. */
export interface PluginBase {
  id: string;
  name: string;
  kind: PluginKind;
  description?: string;
  version?: string;
  builtIn?: boolean;
  configSchema?: ConfigSchema;
  capabilities?: PluginCapabilities;
  init?(ctx: PluginContext): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

/** Optional host context for `init` hooks. */
export interface PluginContext {
  getConfig(): Record<string, unknown>;
  setStatus(msg: string, level?: LogLevel): void;
  host: {
    fetch?: typeof fetch;
  };
}

/** Registry / config key: `${kind}:${id}`. */
export function pluginKey(kind: PluginKind, id: string): string {
  return `${kind}:${id}`;
}

/** Single OHLCV bar. `time` is Unix seconds (Lightweight Charts convention). */
export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  /** Venue reported this candle as closed (e.g. Binance kline `k.x`). */
  closed?: boolean;
}

// --- Source ---

export interface SourceOpts {
  symbol: string;
  interval: string;
  limit?: number;
  /** Inclusive lower bound (unix seconds). */
  startTime?: number;
  /** Inclusive upper bound (unix seconds). */
  endTime?: number;
  signal?: AbortSignal;
  config?: Record<string, unknown>;
}

export interface SourcePlugin extends PluginBase {
  kind: 'source';
  fetchHistorical(opts: SourceOpts): Promise<Bar[]>;
  searchSymbols?(query: string, config?: Record<string, unknown>): Promise<string[]>;
}

// --- Stream ---

export interface StreamOpts {
  symbol: string;
  interval: string;
  config?: Record<string, unknown>;
  lastBar?: Bar | null;
  onBar: (b: Bar) => void;
  onError: (e: Error) => void;
  onStatus: (s: {
    state: 'open' | 'closed' | 'reconnecting' | string;
    url?: string;
    detail?: string;
  }) => void;
}

export interface StreamPlugin extends PluginBase {
  kind: 'stream';
  /** @returns stop/cleanup function */
  start(opts: StreamOpts): () => void;
}

// --- Engine ---

export interface EngineLibrarySource {
  namespace: string;
  name: string;
  version: number;
  source: string;
}

export interface EngineOpts {
  script: string;
  bars: Bar[];
  config?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  libraries?: EngineLibrarySource[];
  signal?: AbortSignal;
}

export interface RunResult {
  status: 'success' | 'error';
  plots: (number | null)[];
  series?: Record<string, (number | null)[]>;
  events: Array<{
    time: number;
    type: string;
    id?: string;
    price?: number;
    dir?: string;
    [k: string]: unknown;
  }>;
  drawings?: Array<Record<string, unknown>>;
  inputs?: Array<Record<string, unknown>> | unknown;
  logs?: Array<{ level?: string; message?: string; [k: string]: unknown }>;
  profile?: Record<string, unknown>;
  error?: string;
  meta?: {
    mode?: string;
    script_id?: string;
    run_id?: string;
    ms?: number;
    count?: number;
    overlay?: boolean;
    script_name?: string;
    transport?: string;
    plot_meta?: Record<string, unknown>;
    inputs?: unknown;
    logs?: Array<{ level?: string; message?: string; [k: string]: unknown }>;
    profile?: Record<string, unknown>;
    [k: string]: unknown;
  };
}

export interface EnginePlugin extends PluginBase {
  kind: 'engine';
  isReady(): Promise<boolean>;
  run(opts: EngineOpts): Promise<RunResult>;
}

// --- Storage (URL install is rejected by AXIS) ---

export interface ScriptMeta {
  id: string;
  name: string;
  description?: string;
  path?: string;
  updatedAt: number;
  createdAt?: number;
  revision?: string;
  tags?: string[];
  scriptKind?: 'indicator' | 'strategy' | 'library' | 'unknown';
  pineVersion?: string;
}

export interface ScriptDocument extends ScriptMeta {
  content: string;
}

export interface SyncResult {
  ok: boolean;
  message?: string;
  revision?: string;
  conflicts?: Array<{ id: string; localRev?: string; remoteRev?: string }>;
}

export interface StorageStatus {
  connected: boolean;
  dirty?: boolean;
  lastSyncAt?: number;
  branch?: string;
  remote?: string;
  error?: string;
}

export interface StoragePlugin extends PluginBase {
  kind: 'storage';
  list(opts?: { prefix?: string; config?: Record<string, unknown> }): Promise<ScriptMeta[]>;
  read(id: string, config?: Record<string, unknown>): Promise<ScriptDocument>;
  write(doc: ScriptDocument, config?: Record<string, unknown>): Promise<ScriptMeta>;
  remove(id: string, config?: Record<string, unknown>): Promise<void>;
  saveDraft?(doc: { content: string; name?: string }, config?: Record<string, unknown>): Promise<void>;
  loadDraft?(config?: Record<string, unknown>): Promise<{ content: string; name?: string } | null>;
  sync?(direction: 'push' | 'pull' | 'both', config?: Record<string, unknown>): Promise<SyncResult>;
  getStatus?(config?: Record<string, unknown>): Promise<StorageStatus>;
}

// --- Dataset ---

export type DatasetKind = 'ohlcv' | 'scalar_series' | 'multi_series' | 'events' | 'table';
export type Finality = 'pending' | 'safe' | 'finalized' | 'unknown';

export interface OnchainInstrument {
  chainId: string;
  address?: string;
  protocolId?: string;
  metric: string;
  facet?: string;
  symbol: string;
}

export interface TimePoint {
  time: number;
  value: number;
  meta?: Record<string, number | string | boolean>;
}

export interface EventPoint {
  time: number;
  type: string;
  title?: string;
  severity?: 'info' | 'warn' | 'critical';
  price?: number;
  payload?: Record<string, unknown>;
}

export interface OnchainDataset {
  id: string;
  kind: DatasetKind;
  instrument: OnchainInstrument;
  resolution: string;
  bars?: Bar[];
  series?: Record<string, TimePoint[]>;
  points?: TimePoint[];
  events?: EventPoint[];
  rows?: Record<string, unknown>[];
  asOf: number;
  finality: Finality;
  provenance: { provider: string; queryId?: string; url?: string };
  synthetic?: boolean;
}

export interface DatasetFetchOpts {
  instrument: OnchainInstrument;
  resolution?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  signal?: AbortSignal;
  config?: Record<string, unknown>;
}

export interface DatasetPlugin extends PluginBase {
  kind: 'dataset';
  fetchDataset(opts: DatasetFetchOpts): Promise<OnchainDataset>;
  searchInstruments?(query: string, config?: Record<string, unknown>): Promise<OnchainInstrument[]>;
}

// --- Component ---

export type ComponentSlot = 'manager-tab' | 'results-tab' | 'topbar-action' | 'settings-section';

export interface ComponentPlugin extends PluginBase {
  kind: 'component';
  slots: ComponentSlot[];
  mount(slot: string, el: HTMLElement, api: Record<string, unknown>): () => void;
}

export type AnyPlugin =
  | SourcePlugin
  | StreamPlugin
  | EnginePlugin
  | StoragePlugin
  | DatasetPlugin
  | ComponentPlugin;
