/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Import built ESM modules and assert the AXIS plugin contract.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertPlugin } from '../src/helpers';

const root = join(import.meta.dir, '..');
const files = [
  'public/plugin.js',
  'public/examples/source.js',
  'public/examples/stream.js',
  'public/examples/engine.js',
  'public/examples/dataset.js',
  'public/examples/component.js',
];

let failed = 0;
for (const rel of files) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    console.error(`missing ${rel} — run bun run build`);
    failed++;
    continue;
  }
  try {
    const mod = await import(pathToFileURL(abs).href);
    const plugin = assertPlugin(mod);
    console.log(`ok  ${rel}  ${plugin.kind}:${plugin.id}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`fail ${rel}  ${msg}`);
  }
}

if (failed) {
  process.exit(1);
}
