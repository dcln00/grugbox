import { describe, expect, test } from 'vitest'

import { OG_FALLBACK_IMAGE, resolveOgImage } from '../app/utils/media'

const SITE_URL = 'https://grugbox.world'

describe('resolveOgImage', () => {
	test('absolutises a root-relative content path against the site url', () => {
		const result = resolveOgImage('/content/almond.jpg', SITE_URL)

		expect(result).toBe('https://grugbox.world/content/almond.jpg')
	})

	test('keeps a nested content path intact', () => {
		const result = resolveOgImage('/content/art/big.png', SITE_URL)

		expect(result).toBe('https://grugbox.world/content/art/big.png')
	})

	test('leaves an already absolute url untouched', () => {
		const result = resolveOgImage('https://cdn.example.com/cover.jpg', SITE_URL)

		expect(result).toBe('https://cdn.example.com/cover.jpg')
	})

	test('leaves an absolute http url untouched, not just https', () => {
		const result = resolveOgImage('http://cdn.example.com/cover.jpg', SITE_URL)

		expect(result).toBe('http://cdn.example.com/cover.jpg')
	})

	test('falls back when the image is missing', () => {
		expect(resolveOgImage(undefined, SITE_URL)).toBe(OG_FALLBACK_IMAGE)
		expect(resolveOgImage(null, SITE_URL)).toBe(OG_FALLBACK_IMAGE)
		expect(resolveOgImage('', SITE_URL)).toBe(OG_FALLBACK_IMAGE)
	})

	test('falls back for video sources, which crawlers cannot preview', () => {
		expect(resolveOgImage('/content/clip.webm', SITE_URL)).toBe(OG_FALLBACK_IMAGE)
		expect(resolveOgImage('/content/clip.mp4', SITE_URL)).toBe(OG_FALLBACK_IMAGE)
		expect(resolveOgImage('/content/clip.MOV?token=1', SITE_URL)).toBe(OG_FALLBACK_IMAGE)
	})

	test('falls back rather than throwing on a malformed site url', () => {
		expect(resolveOgImage('/content/almond.jpg', 'not a url')).toBe(OG_FALLBACK_IMAGE)
	})

	test('falls back on a protocol-relative url rather than resolving it against https', () => {
		// new URL('//evil.example/x.jpg', 'https://grugbox.world') yields
		// https://evil.example/x.jpg, so this must not slip through as absolute.
		expect(resolveOgImage('//evil.example/x.jpg', SITE_URL)).toBe(OG_FALLBACK_IMAGE)
	})

	test('the fallback is itself absolute', () => {
		expect(OG_FALLBACK_IMAGE.startsWith('https://')).toBe(true)
	})
})
