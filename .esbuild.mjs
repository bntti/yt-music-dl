import { build } from 'esbuild';

build({
    entryPoints: ['./src/index.ts'],
    outdir: './dist',
    minify: true,
    bundle: true,
    platform: 'node',
    format: 'esm',
    sourcemap: true,
    packages: 'external',
    outExtension: { '.js': '.mjs' },
}).catch(() => process.exit(1));
