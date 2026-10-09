import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
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
				sitemap: defineSitemapSchema({
					z,
					name: 'articles',
					onUrl(url, entry) {
						const date = entry.date
						if (typeof date === 'string' || date instanceof Date) url.lastmod = date
					},
				}),
				description: z.string(),
				image: z.string(),
				video: z.string().optional(),
				date: z.date(),
				tags: z.array(z.string()),
				category: z.enum(ARTICLE_CATEGORIES),
			})
		}),
		reviews: defineCollection({
			source: 'reviews/*.md',
			type: 'page',
			schema: z.object({
				sitemap: defineSitemapSchema({
					z,
					name: 'reviews',
					onUrl(url, entry) {
						const date = entry.date
						if (typeof date === 'string' || date instanceof Date) url.lastmod = date
					},
				}),
				description: z.string(),
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
				albumTitle: z.string().optional(),
				score: z.number().min(0).max(10).optional(),
				releaseDate: z.string().optional(),
				keyTracks: z.union([z.array(z.string()), z.string()]).optional(),
				good: z.array(z.string()).optional(),
				bad: z.array(z.string()).optional(),
			})
		}),
		interviews: defineCollection({
			source: 'interviews/*.md',
			type: 'page',
			schema: z.object({
				sitemap: defineSitemapSchema({
					z,
					name: 'interviews',
					onUrl(url, entry) {
						const date = entry.date
						if (typeof date === 'string' || date instanceof Date) url.lastmod = date
					},
				}),
				description: z.string().optional(),
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()),
			})
		}),
		playlists: defineCollection({
			source: 'playlists/*.md',
			type: 'page',
			schema: z.object({
				sitemap: defineSitemapSchema({
					z,
					name: 'playlists',
					onUrl(url, entry) {
						const date = entry.date
						if (typeof date === 'string' || date instanceof Date) url.lastmod = date
					},
				}),
				description: z.string().optional(),
				image: z.string(),
				date: z.date(),
				tags: z.array(z.string()).optional(),
			})
		}),
		legal: defineCollection({
			source: 'legal/*.md',
			type: 'page',
			schema: z.object({
				sitemap: defineSitemapSchema({
					z,
					name: 'legal',
					onUrl(url) {
						url.loc = url.loc.replace('/legal/', '/')
					},
				}),
				title: z.string(),
				description: z.string().optional(),
				lastUpdated: z.string().optional(),
			})
		}),
	},
})