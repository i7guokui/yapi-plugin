import { build } from 'esbuild'
import { solidPlugin } from 'esbuild-plugin-solid';

build({
  entryPoints: [
    {
      in: './src/index.ts',
      out: 'index'
    },
    {
      in: './src/background.ts',
      out: 'background'
    },
    {
      in: './src/options.tsx',
      out: 'options'
    },
    {
      in: './src/sandbox.ts',
      out: 'sandbox'
    }
  ],
  // minify: true,
  outdir: 'public',
  bundle: true,
  write: true,
  allowOverwrite: true,
  plugins: [solidPlugin()]
})
