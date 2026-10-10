/**
 * The Grugbox symbol (not the wordmark), as raw SVG path data for the canvas.
 *
 * Converted from the supplied SVGs, which used <polygon points="..."> — Path2D
 * only accepts path `d` data, so each point list became M/L/Z. The coordinates
 * are unchanged; the black variant's repeated closing point is a no-op that the
 * conversion drops.
 *
 * Two colourways are supplied by design: a white mark for dark photography and a
 * black one for light. The geometry is identical between them, so the paths are
 * stored once and colour is applied at paint time.
 *
 * The shapes OVERLAP and are listed in the order they must be painted: the third
 * shape sits on top of the base triangle, so reordering this array changes the
 * mark.
 *
 * Deliberately separate from `app/utils/logo.ts`, which is the site wordmark
 * used by the header and footer and is unaffected by anything here.
 */
export const MARK_VIEWBOX = { width: 881.09, height: 880.65 } as const

/**
 * The mark has two tones: `body` is the main silhouette, `base` is the inset
 * triangle that reads as a shade against it.
 */
export type MarkTone = 'body' | 'base'

export interface MarkShape {
	/** SVG path data. */
	d: string
	tone: MarkTone
}

export const MARK_SHAPES: readonly MarkShape[] = [
	{ d: 'M881.04 0L752.27 128.78L1.27 879.75L1.27 0Z', tone: 'body' },
	{ d: 'M0 880.65L440.51 440.07L881.09 880.64Z', tone: 'base' },
	{ d: 'M878.94 878.84L879.13 438.52L439.53 439.44Z', tone: 'body' },
]

export type MarkTheme = 'white' | 'black'

/**
 * Body colours come from the SVGs' unclassed shapes — SVG's initial fill is
 * black, so the black variant's body is #000000 rather than an explicit rule.
 * Base colours come from their .cls-1 rules.
 */
export const MARK_THEMES: Record<MarkTheme, Record<MarkTone, string>> = {
	white: { body: '#ffffff', base: '#d7d7d7' },
	black: { body: '#000000', base: '#161616' },
}

/** A body colour dark enough to need the light swatch behind it in the picker. */
export const isDarkMark = (theme: MarkTheme): boolean => theme === 'black'

export const MARK_THEME_OPTIONS: readonly { value: MarkTheme; label: string }[] = [
	{ value: 'white', label: 'White' },
	{ value: 'black', label: 'Black' },
]

export const markThemeLabel = (theme: MarkTheme): string =>
	MARK_THEME_OPTIONS.find(option => option.value === theme)?.label ?? theme

/**
 * A slide stores `null` when it follows the shared default, rather than
 * duplicating the current default at attach time — so changing the default later
 * still moves every slide that never opted out.
 */
export const resolveMarkTheme = (
	override: MarkTheme | null | undefined,
	fallback: MarkTheme,
): MarkTheme => override ?? fallback
