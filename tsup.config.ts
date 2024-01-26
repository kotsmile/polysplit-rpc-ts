import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts', './src/routes/**/*.ts'],
  outDir: './dist',
  tsconfig: './tsconfig.build.json',
  clean: true,
  minify: true,
})
