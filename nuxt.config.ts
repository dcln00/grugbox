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
		"@nuxtjs/turnstile",
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
	turnstile: {
		siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
		addValidateEndpoint: true,
	},
	runtimeConfig: {
		googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
		resendApiKey: process.env.RESEND_API_KEY || '',
		workspacePassword: process.env.WORKSPACE_PASSWORD || '',
		turnstile: {
			secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '',
		},
	},
	vite: {
		server: {
			allowedHosts: true,
		},
	},
})