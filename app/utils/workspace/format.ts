const MAX_SLUG_LENGTH = 60
const FALLBACK_SLUG = 'post'

/** `0:07`, `1:00`, `12:34`. */
export const formatDuration = (seconds: number): string => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

	const whole = Math.floor(seconds)
	const minutes = Math.floor(whole / 60)
	const remainder = whole % 60

	return `${minutes}:${String(remainder).padStart(2, '0')}`
}

/**
 * Filename-safe slug. Quotes are dropped rather than hyphenated so
 * "Kanye West's Vocals" reads as `kanye-wests-vocals`, not `kanye-west-s-vocals`.
 * Non-Latin scripts reduce to nothing and fall back to a generic name.
 */
export const slugify = (value: string): string => {
	const slug = value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/['’‘"“”]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/-+$/g, '')

	return slug || FALLBACK_SLUG
}

/**
 * `grugbox-music-kanye-wests-vocals-01.png`. The index is zero-padded and only
 * added for multi-slide exports, so a single image keeps a clean name.
 */
export const buildFileName = (
	category: string,
	caption: string,
	index: number,
	total: number,
	extension: string,
): string => {
	const parts = ['grugbox']

	if (category.trim()) parts.push(slugify(category))
	if (caption.trim()) parts.push(slugify(caption))
	if (total > 1) parts.push(String(index + 1).padStart(2, '0'))

	return `${parts.join('-')}.${extension}`
}
