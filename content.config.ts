import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const ARTICLE_CATEGORIES = [
	'feature',
	'editorial',
	'profile',
	'event',
	'screen',
] as const

export default defineContentConfig({
	collections: {
		articles: defineCollection({
			source: 'articles/*.md',
			type: 'page',
			schema: z.object({
				description: z.string(),
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
				category: z.enum(ARTICLE_CATEGORIES),
			})
		}),
		reviews: defineCollection({
			source: 'reviews/*.md',
			type: 'page',
			schema: z.object({
				description: z.string(),
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
				score: z.number().int().min(1).max(10).optional(),
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