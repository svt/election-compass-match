import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import { dts } from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs', // CommonJS format
    },
    plugins: [del({ targets: 'dist' }), typescript()],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm', // ES Module format
    },
    plugins: [typescript()],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/election-compass-match.d.ts', format: 'es' }],
    plugins: [dts(), del({ targets: 'dist/dts', hook: 'buildEnd' })],
  },
];
