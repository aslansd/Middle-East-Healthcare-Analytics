import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");

// Cloud Run injects PORT and expects the container to listen on it.
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

if (!existsSync(distDir)) {
  console.error(
    "dist/ was not found. Run `npm run build` before starting the server."
  );
  process.exit(1);
}

const app = express();

// Cloud Run terminates TLS at the load balancer, so trust its forwarded headers.
app.set("trust proxy", true);
app.disable("x-powered-by");

// Cheap, dependency-free health endpoint for Cloud Run startup probes.
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Fingerprinted assets are immutable and safe to cache for a year.
app.use(
  "/assets",
  express.static(path.join(distDir, "assets"), {
    immutable: true,
    maxAge: "1y"
  })
);

// Everything else in dist: short cache, revalidated on each deploy.
app.use(
  express.static(distDir, {
    maxAge: "1h",
    index: false
  })
);

// SPA fallback. The app keeps its state in the URL hash, so only the document
// itself needs serving here; the hash never reaches the server.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) {
      console.error("Failed to send index.html:", error);
      res.status(500).send("Application failed to load.");
    }
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Serving on http://${HOST}:${PORT}`);
});

// Cloud Run sends SIGTERM before stopping an instance; exit cleanly so
// in-flight requests are allowed to finish.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down.`);
  server.close(() => process.exit(0));
  // Force-exit if connections do not drain in time.
  setTimeout(() => process.exit(0), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
