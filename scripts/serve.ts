/**
 * Copyright (c) 2026 HOOX · AXIS · hoox-sh
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * CORS-enabled static server for AXIS `import()`.
 *
 *   bun run serve
 *   → http://127.0.0.1:4173/plugin.js
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

if (!existsSync(join(root, "plugin.js"))) {
  console.error("public/plugin.js missing — run `bun run build` first");
  process.exit(1);
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

function contentType(pathname: string): string {
  if (pathname.endsWith(".js") || pathname.endsWith(".mjs")) {
    return "text/javascript; charset=utf-8";
  }
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  return "text/html; charset=utf-8";
}

function safeJoin(base: string, reqPath: string): string | null {
  const decoded = decodeURIComponent(reqPath.split("?")[0] || "/");
  const cleaned = decoded.replace(/\\/g, "/");
  if (cleaned.includes("\0") || cleaned.includes("..")) return null;
  const rel = cleaned === "/" ? "index.html" : cleaned.replace(/^\//, "");
  const abs = join(base, rel);
  if (!abs.startsWith(base)) return null;
  return abs;
}

const server = Bun.serve({
  hostname: host,
  port,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS });
    }
    const url = new URL(req.url);
    const filePath = safeJoin(root, url.pathname);
    if (!filePath) {
      return new Response("Bad Request", { status: 400, headers: CORS });
    }
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404, headers: CORS });
    }
    const headers = {
      ...CORS,
      "Content-Type": contentType(
        url.pathname === "/" ? "/index.html" : url.pathname,
      ),
      "Cache-Control": "no-store",
    };
    if (req.method === "HEAD") return new Response(null, { headers });
    return new Response(file, { headers });
  },
});

const origin = `http://${server.hostname}:${server.port}`;
console.log(`AXIS plugin server  ${origin}`);
console.log("");
console.log("Install in AXIS → Manager → Plugins → Install from URL:");
console.log(`  ${origin}/plugin.js`);
console.log(`  ${origin}/examples/source.js`);
console.log(`  ${origin}/examples/stream.js`);
console.log(`  ${origin}/examples/engine.js`);
console.log(`  ${origin}/examples/dataset.js`);
console.log(`  ${origin}/examples/component.js`);
console.log("");
console.log(
  "AXIS production builds allowlist remote hosts. Dev (Vite) is open.",
);
