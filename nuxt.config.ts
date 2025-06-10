export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/tailwindcss'
  ],
  tailwindcss: {
		viewer: false,
		cssPath: ['~/assets/tailwind.css', { injectPosition: 'first' }],
	},
  nitro: {
    preset: 'vercel',
  }
})