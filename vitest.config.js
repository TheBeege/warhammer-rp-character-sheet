import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for faster DOM simulation
    environment: 'happy-dom',

    // Test file patterns
    include: ['tests/**/*.test.js', 'docs/**/*.test.js'],

    // Setup file to run before each test
    setupFiles: ['./tests/setup.js'],

    // Coverage configuration (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['docs/**/*.{js,mjs}'],
      exclude: ['docs/**/*.test.js', 'node_modules/**', 'agents/**']
    }
  }
});
