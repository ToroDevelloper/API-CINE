import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequestListener } from "@react-router/node";
import * as build from "./build/server/index.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = resolve(__dirname, "build/client");
const port = Number.parseInt(process.env.PORT || "5173", 10);
const host = process.env.HOST || "0.0.0.0";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const reactRouterListener = createRequestListener({
  build,
  mode: process.env.NODE_ENV || "production"
});

function sendStaticAsset(req, res) {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const candidate = normalize(join(clientDir, decodedPath));

  if (!candidate.startsWith(clientDir) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    return false;
  }

  res.writeHead(200, {
    "Content-Type": contentTypes[extname(candidate)] || "application/octet-stream",
    "Cache-Control": decodedPath.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=300"
  });
  createReadStream(candidate).pipe(res);
  return true;
}

const server = createServer((req, res) => {
  if (sendStaticAsset(req, res)) {
    return;
  }

  reactRouterListener(req, res);
});

server.listen(port, host, () => {
  console.log(`Frontend listening on http://${host}:${port}`);
});
