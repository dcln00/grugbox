import { defineConfig } from 'vitest/config'

/**
 * Deliberately standalone — no Nuxt plugin, no jsdom.
 *
 * Everything under test is a pure function that imports neither Vue nor Nuxt, so
 * a plain Node environment is enough and keeps this fast and independent of the
 * app build.
 */
export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.spec.ts'],
	},
})
