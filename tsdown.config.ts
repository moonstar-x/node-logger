import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  target: 'node22.12',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
  outputOptions: { exports: 'named' }
});

export default config;
