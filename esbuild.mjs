import { build } from 'esbuild';

build({
    bundle: true,
    entryPoints: ['./src/index.ts'],
    format: 'esm',
    minify: true,
    outdir: './dist',
    packages: 'external',
    platform: 'node',
    sourcemap: true,
}).catch(() => process.exit(1));
