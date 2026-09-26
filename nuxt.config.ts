import { existsSync } from "node:fs"
import { readdir, rm } from "node:fs/promises"
import { basename, join } from "node:path"

const DS_STORE = ".DS_Store"

/**
 * Nuxt copies everything under `public/` into the build verbatim, including
 * `.DS_Store` — which `.gitignore` cannot prevent, since it never reaches git.
 * That would publish macOS folder metadata at the site root.
 */
async function stripDsStore(publicDir: string): Promise<void> {
	if (!existsSync(publicDir)) return

	const entries = await readdir(publicDir, { recursive: true })
	await Promise.all(
		entries
			.filter((entry) => basename(entry) === DS_STORE)
			.map((entry) => rm(join(publicDir, entry), { force: true })),
	)
}

export default defineNuxtConfig({
	compatibilityDate: "2026-09-25",
	srcDir: "app",
	devtools: { enabled: true },
	modules: [
		"@nuxt/fonts",
		"@nuxt/content",
		"@nuxt/image",
		"@nuxtjs/tailwindcss",
		"@vueuse/nuxt",
		"nuxt-gtag",
	],
	fonts: {
		defaults: {
			weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
		},
	},
	gtag: {
		id: "G-XHZXSE4QPC",
	},
	hooks: {
		async "nitro:build:public-assets"(nitro) {
			await stripDsStore(nitro.options.output.publicDir)
		},
	},
	nitro: {
		preset: "vercel",
	},
})
