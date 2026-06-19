import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";
import { builtinModules } from "node:module";

const require = createRequire(import.meta.url);
const esbuild = require("/home/runner/workspace/node_modules/.pnpm/esbuild@0.27.3/node_modules/esbuild/lib/main.js");

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = path.resolve(rootDir, "artifacts/api-server");
const outFile = path.resolve(artifactDir, "index.mjs");

async function buildAll() {
  console.log("Building api-server...");
  await esbuild.build({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: outFile,
    logLevel: "info",
    external: [
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "pino-pretty",
      "pino/file",
      "pino-worker",
      "thread-stream",
    ],
  });
  console.log("Build complete:", outFile);
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
