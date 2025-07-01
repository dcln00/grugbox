export default defineNuxtConfig({
	compatibilityDate: "2025-05-15",
	devtools: { enabled: true },
	modules: [
		"@nuxt/fonts",
		"@nuxt/content",
		"@nuxt/image",
		"@nuxtjs/tailwindcss",
		"nuxt-svgo",
		"@vueuse/nuxt",
		"nuxt-gtag",
	],
	tailwindcss: {
		viewer: false,
	},
	fonts: {
		defaults: {
			weights: [100, 200, 300, 400, 500, 600, 700, 8800, 900],
		},
	},
	gtag: {
		id: "G-XHZXSE4QPC",
	},
	nitro: {
		preset: "vercel",
	},
})
