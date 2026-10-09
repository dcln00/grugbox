import { existsSync, readdirSync } from "node:fs"
import { readdir, rm } from "node:fs/promises"
import { basename, join } from "node:path"

const DS_STORE = ".DS_Store"
const REVIEWS_DIR = join("content", "reviews")
const PERMANENT_REDIRECT = 301

interface RouteRedirect {
	redirect: { to: string, statusCode: number }
}

/**
 * Reviews used to live in `content/articles`, so their paths were
 * /articles/<slug>. Moving them into their own collection rewrote those paths to
 * /reviews/<slug>, which would 404 every existing inbound link. Derive the
 * redirect map from the collection itself so new reviews are covered too.
 */
function reviewRedirects(): Record<string, RouteRedirect> {
	if (!existsSync(REVIEWS_DIR)) return {}

	return Object.fromEntries(
		readdirSync(REVIEWS_DIR)
			.filter((file) => file.endsWith(".md"))
			.map((file) => {
				const slug = basename(file, ".md")
				return [
					`/articles/${slug}`,
					{ redirect: { to: `/reviews/${slug}`, statusCode: PERMANENT_REDIRECT } },
				]
			}),
	)
}

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
	css: ["~/assets/css/tailwind.css"],
	devtools: { enabled: true },
	site: {
		url: 'https://grugbox.world',
		name: 'Grugbox',
	},
	modules: [
		"@nuxtjs/sitemap",
		"@nuxt/fonts",
		"@nuxt/content",
		"@nuxt/image",
		"@nuxtjs/tailwindcss",
		"@vueuse/nuxt",
		"nuxt-gtag",
	],
	fonts: {
		families: [
			{ name: "Google Sans", provider: "google", global: true, weights: ["400", "500", "600", "700"] },
		],
		defaults: {
			weights: ["400", "500", "600", "700"],
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
	routeRules: {
		...reviewRedirects(),
	},
	nitro: {
		preset: "vercel",
		prerender: {
			routes: ["/sitemap.xml"],
		},
	},
	runtimeConfig: {
		googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
	},
	vite: {
		server: {
			allowedHosts: true,
		},
	},
})