import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm } from "node:fs/promises";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

const workspaceRoot = path.resolve(artifactDir);

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "artifacts/api-server/src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    alias: {
      "@workspace/db": path.join(workspaceRoot, "lib/db/src/index.ts"),
      "@workspace/api-zod": path.join(workspaceRoot, "lib/api-zod/src/index.ts"),
      "@workspace/api-client-react": path.join(workspaceRoot, "lib/api-client-react/src/index.ts"),
      "@workspace/integrations-openai-ai-server": path.join(workspaceRoot, "lib/integrations-openai-ai-server/src/index.ts"),
      "@workspace/integrations-openai-ai-react": path.join(workspaceRoot, "lib/integrations-openai-ai-react/src/index.ts"),
    },
    external: [
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
    ],
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
