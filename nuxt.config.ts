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
		// Must precede @nuxtjs/robots: it injects the Content-Signal group by
		// pushing onto nuxt.options.robots.groups, which robots reads during its
		// own setup. Listed after it, the line silently never appears.
		"nuxt-ai-ready",
		"@nuxtjs/robots",
		"nuxt-link-checker",
		// Registered last: it wraps build assets and hooks the Vercel output.
		"nuxt-skew-protection",
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
	robots: {
		// The module owns /robots.txt. Rules live here rather than in
		// public/robots.txt so there is one source; the Sitemap line is added by
		// @nuxtjs/sitemap through the robots:config hook.
		credits: false,
		disallow: ["/__nuxt_content/", "/workspace"],
		groups: [
			{
				userAgent: ["AdsBot-Google-Mobile", "AdsBot-Google-Mobile-Apps"],
				disallow: ["/workspace"],
			},
		],
	},
	linkChecker: {
		// A dead external link must never fail a production deploy.
		failOnError: false,
		fetchRemoteUrls: false,
		excludeLinks: [
			"/workspace/**",
			"/admin/**",
			"/__nuxt_content/**",
		],
		excludePages: ["/workspace/**"],
		report: {
			html: false,
			markdown: true,
			json: true,
			publish: false,
		},
	},
	aiReady: {
		// Pages are rendered on demand on Vercel, so there is no writable
		// database to index into. llms.txt is built from the sitemap at build
		// time instead, which needs no runtime storage.
		database: false,
		contentSignal: {
			// Grugbox's journalism may be read, quoted and cited; it may not be
			// used as training data.
			aiTrain: false,
			search: true,
			aiInput: true,
		},
		llmsTxt: {
			markdownLinks: true,
			notes: [
				"Grugbox is a music, culture and lifestyle publication covering Ghana and beyond.",
				"Articles, reviews, interviews and playlists are also available as Markdown by appending .md to any page URL.",
			],
		},
	},
	skewProtection: {
		// Vercel isolates invocations, so a long-lived SSE or WebSocket
		// connection is not available; polling is the strategy that works there.
		updateStrategy: "polling",
		reloadStrategy: "prompt",
		bundleAssets: true,
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
