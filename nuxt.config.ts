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
	nitro: {
		preset: "vercel",
		prerender: {
			routes: ["/sitemap.xml"],
			ignore: ["/workspace", "/workspace/**"],
		},
	},
	routeRules: {
		"/workspace/**": { prerender: false },
	},
	sitemap: {
		exclude: ["/workspace", "/workspace/**"],
	},
	runtimeConfig: {
		googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
		workspacePassword: process.env.WORKSPACE_PASSWORD || '',
	},
	vite: {
		server: {
			allowedHosts: true,
		},
	},
})