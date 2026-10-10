import { CHIP_MAX_LABEL_LENGTH } from './constants'

export const CATEGORY_PRESETS: readonly string[] = [
	'MUSIC',
	'CULTURE',
	'NEWS',
	'REVIEW',
	'INTERVIEW',
	'FEATURE',
	'SPOTLIGHT',
	'FILM',
	'FASHION',
	'EVENT',
]

/**
 * Uppercasing at the source keeps recents deduped ("Music" and "MUSIC" are the
 * same category) and matches how the chip renders it. The length cap keeps a
 * long label from running into the logo on the right of the canvas.
 */
export const normalizeCategory = (value: string): string =>
	value.trim().replace(/\s+/g, ' ').toUpperCase().slice(0, CHIP_MAX_LABEL_LENGTH)
