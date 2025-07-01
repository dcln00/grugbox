export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },
	modules: [
		'@nuxt/fonts',
		'@nuxt/content',
		'@nuxt/image',
		'@nuxtjs/tailwindcss',
		'nuxt-svgo',
		'@vueuse/nuxt',
	],
	tailwindcss: {
		viewer: false,
	},
	fonts: {
		defaults: {
			weights: [100, 200, 300, 400, 500, 600, 700, 8800, 900],
		},
	},
	nitro: {
		preset: 'vercel',
	},
})