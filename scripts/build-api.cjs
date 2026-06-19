const esbuild = require('/home/runner/workspace/node_modules/.pnpm/esbuild@0.27.3/node_modules/esbuild/lib/main.js');
const path = require('path');
const fs = require('fs');
const { builtinModules } = require('module');

const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.resolve(rootDir, 'artifacts/api-server');
const outFile = path.resolve(artifactDir, 'index.mjs');

// Workspace package aliases - resolve TypeScript source directly
const workspaceAliases = {
  '@workspace/db': path.resolve(rootDir, 'lib/db/src/index.ts'),
  '@workspace/api-zod': path.resolve(rootDir, 'lib/api-zod/src/index.ts'),
  '@workspace/integrations-openai-ai-server': path.resolve(rootDir, 'lib/integrations-openai-ai-server/src/index.ts'),
  '@workspace/integrations': path.resolve(rootDir, 'lib/integrations/src/index.ts'),
};

const workspaceAliasPlugin = {
  name: 'workspace-aliases',
  setup(build) {
    Object.entries(workspaceAliases).forEach(([pkg, resolvedPath]) => {
      const escapedPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      build.onResolve({ filter: new RegExp('^' + escapedPkg + '$') }, () => {
        return { path: resolvedPath };
      });
    });
    
    // Handle .js extensions that are actually .ts files in workspace source
    build.onResolve({ filter: /\.js$/ }, (args) => {
      if (!args.importer) return null;
      if (!args.importer.includes('/lib/') && !args.importer.includes('/artifacts/api-server/src/')) return null;
      const tsPath = args.path.replace(/\.js$/, '.ts');
      const resolved = path.resolve(path.dirname(args.importer), tsPath);
      if (fs.existsSync(resolved)) return { path: resolved };
      return null;
    });
  }
};

async function buildAll() {
  console.log('Building api-server as CJS bundle...');
  
  // Build as CJS to handle CJS dependencies (express, pg, cors, etc.) properly
  const cjsOutFile = outFile.replace('.mjs', '.cjs');
  
  await esbuild.build({
    entryPoints: [path.resolve(artifactDir, 'src/index.ts')],
    platform: 'node',
    bundle: true,
    format: 'cjs',
    outfile: cjsOutFile,
    logLevel: 'info',
    plugins: [workspaceAliasPlugin],
    external: [
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
      // pino transports (loaded dynamically)
      'pino-pretty',
      'pino/file',
      'thread-stream',
      // native addons and problematic packages
      '*.node',
      'sharp',
      'better-sqlite3',
      'sqlite3',
      'canvas',
      'bcrypt',
      'argon2',
      'fsevents',
      're2',
      'farmhash',
      'xxhash-addon',
      'bufferutil',
      'utf-8-validate',
      'ssh2',
      'cpu-features',
      'dtrace-provider',
      'isolated-vm',
      'lightningcss',
      'pg-native',
      'oracledb',
      'qrcode-terminal',
      '@whiskeysockets/baileys',
    ],
    tsconfig: path.resolve(artifactDir, 'tsconfig.json'),
  });
  
  // Write an ESM wrapper that loads the CJS bundle
  const esmWrapper = `// ESM wrapper for CJS bundle
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
require(join(__dirname, 'index.cjs'));
`;
  fs.writeFileSync(outFile, esmWrapper);
  
  console.log('Build complete:', cjsOutFile, '(ESM wrapper:', outFile, ')');
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
