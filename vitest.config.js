import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Use happy-dom for faster DOM simulation
		environment: 'happy-dom',

		// Test file patterns
		include: ['tests/**/*.{test,spec}.{js,ts}'],

		// Setup file to run before each test
		setupFiles: ['./tests/setup.js'],

		// Coverage configuration (optional)
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: ['tests/**', 'node_modules/**', 'agents/**']
		}
	}
});
