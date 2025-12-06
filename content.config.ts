import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
	collections: {
		articles: defineCollection({
			source: 'articles/*.md',
			type: 'page',
			schema: z.object({
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
			})
		}),
		interviews: defineCollection({
			source: 'interviews/*.md',
			type: 'page',
			schema: z.object({
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
			})
		}),
		playlists: defineCollection({
			source: 'playlists/*.md',
			type: 'page',
			schema: z.object({
				image: z.string(),
				date: z.date()
			})
		}),
	},
})