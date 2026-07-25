import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/instrumentation.ts', // init file — no unit logic
        'src/server.ts', // entry point — no unit logic
        'src/config/**', // env config objects
      ],
    },
  },
});
