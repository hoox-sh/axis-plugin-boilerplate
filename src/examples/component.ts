/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Example **component** — Manager tab + settings section.
 * AXIS may not mount slots yet; `init` attaches a small floating launcher
 * as a fallback (same pattern as PYNE Agent).
 * Install: `http://127.0.0.1:4173/examples/component.js`
 */

import type { ComponentPlugin, PluginContext } from '../types';

const STYLE_ID = 'axis-hello-component-styles';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .axis-hello-card {
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: var(--color-text, #e8eaed);
      background: var(--color-bg-panel, #0f1419);
      border: 1px solid var(--color-border, #2a3441);
      border-radius: 6px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 220px;
    }
    .axis-hello-card h3 { margin: 0; font-size: 13px; font-weight: 600; }
    .axis-hello-card p { margin: 0; font-size: 12px; color: var(--color-text-dim, #8b98a5); }
    .axis-hello-fab {
      position: fixed; right: 16px; bottom: 72px; z-index: 2147483000;
      border: 1px solid var(--color-border, #2a3441);
      background: var(--color-bg-elev, #151b23);
      color: var(--color-text, #e8eaed);
      border-radius: 999px; padding: 6px 12px; font-size: 12px; cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

function renderCard(el: HTMLElement, title: string, body: string) {
  if (typeof document === 'undefined') {
    el.textContent = `${title}: ${body}`;
    return;
  }
  injectStyles();
  el.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'axis-hello-card';
  const h = document.createElement('h3');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  card.append(h, p);
  el.append(card);
}

const exampleComponent: ComponentPlugin = {
  id: 'example-component',
  name: 'Example Component',
  kind: 'component',
  version: '0.1.0',
  description: 'UI slot starter (manager-tab + settings-section). Slots are phase 2 in AXIS.',
  slots: ['manager-tab', 'settings-section', 'topbar-action'],
  capabilities: { offline: true },
  mount(slot, el) {
    if (slot === 'settings-section') {
      renderCard(el, 'Hello settings', 'Replace mount() with your settings form.');
    } else if (slot === 'topbar-action') {
      el.textContent = 'Hello';
    } else {
      renderCard(el, 'Hello AXIS', 'Component plugin mounted. Edit src/examples/component.ts.');
    }
    return () => {
      el.innerHTML = '';
    };
  },
  init(ctx: PluginContext) {
    if (typeof document === 'undefined') return;
    if (document.getElementById('axis-hello-fab')) return;
    injectStyles();
    const fab = document.createElement('button');
    fab.id = 'axis-hello-fab';
    fab.className = 'axis-hello-fab';
    fab.type = 'button';
    fab.textContent = 'Hello';
    fab.addEventListener('click', () => {
      ctx.setStatus?.('Hello from example-component', 'ok');
    });
    document.body.appendChild(fab);
  },
  dispose() {
    if (typeof document === 'undefined') return;
    document.getElementById('axis-hello-fab')?.remove();
    document.getElementById(STYLE_ID)?.remove();
  },
};

export default exampleComponent;
