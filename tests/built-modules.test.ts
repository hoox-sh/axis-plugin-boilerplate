/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertPlugin } from '../src/helpers';

const root = join(import.meta.dir, '..');

const files = [
  ['public/plugin.js', 'source', 'hello-source'],
  ['public/examples/source.js', 'source', 'example-source'],
  ['public/examples/stream.js', 'stream', 'example-stream'],
  ['public/examples/engine.js', 'engine', 'example-engine'],
  ['public/examples/dataset.js', 'dataset', 'example-dataset'],
  ['public/examples/component.js', 'component', 'example-component'],
] as const;

describe('built ESM modules', () => {
  for (const [rel, kind, id] of files) {
    it(`${rel} exports ${kind}:${id}`, async () => {
      const abs = join(root, rel);
      if (!existsSync(abs)) {
        throw new Error(`${rel} missing — run bun run build`);
      }
      const mod = await import(pathToFileURL(abs).href);
      const plugin = assertPlugin(mod);
      expect(plugin.kind).toBe(kind);
      expect(plugin.id).toBe(id);
    });
  }
});
