export const isVideo = (url?: string | null): boolean => {
	if (!url) return false
	const clean = (url.split('?')[0] ?? '').toLowerCase()
	return (
		clean.endsWith('.webm') ||
		clean.endsWith('.mp4') ||
		clean.endsWith('.ogg') ||
		clean.endsWith('.mov')
	)
}

/**
 * Social crawlers reject relative og:image URLs, and every `image:` in content
 * frontmatter is stored as `/content/...`. Fall back rather than emit one.
 *
 * Featured images are served exactly as the editors uploaded them, so their
 * aspect ratios vary (544x680 portraits through 2048x1152 stills) and link
 * previews inherit that shape. That is deliberate — see the Open Graph note in
 * CLAUDE.md before "fixing" it by normalising them.
 */
export const OG_FALLBACK_IMAGE =
	'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1791564146/Grugbox/grugbox-og.jpg'

const ABSOLUTE_URL = /^https?:\/\//i

/**
 * Resolves a frontmatter image to an absolute URL for use as an og:image.
 *
 * Takes `siteUrl` rather than reading `useSiteConfig()` so it stays pure and
 * testable without a Nuxt runtime.
 */
export const resolveOgImage = (
	image: string | null | undefined,
	siteUrl: string,
): string => {
	if (!image || isVideo(image)) return OG_FALLBACK_IMAGE
	if (ABSOLUTE_URL.test(image)) return image
	// Protocol-relative URLs would otherwise resolve to the attacker's host.
	if (image.startsWith('//')) return OG_FALLBACK_IMAGE

	try {
		return new URL(image, siteUrl).toString()
	} catch {
		return OG_FALLBACK_IMAGE
	}
}
