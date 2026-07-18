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
        'src/server.ts', // entry point — no unit logic
        'src/commons/tracing.ts', // side-effect only
        'src/commons/profiling.ts',
        'src/config/**', // env config objects
      ],
    },
    // Prevent Pyroscope/OTel from actually starting during tests
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
