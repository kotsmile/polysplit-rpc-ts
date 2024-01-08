import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    './src/**/*.ts',
    // './src/scripts/*.ts',
    // './src/routing.ts',
    // './src/routes/**/*.ts',
  ],
  outDir: './scripts_dist',
  tsconfig: './tsconfig.build.json',
  clean: true,
})
