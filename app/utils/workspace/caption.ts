import { clamp } from './geometry'
import type { CaptionLayout, CaptionMetrics, MeasureText } from './types'

/**
 * Greedy word wrap.
 *
 * Any single token wider than the line is broken at character level — without
 * that, one long URL or a no-space script produces an infinitely wide line and
 * the fitter below walks all the way down to the minimum font size with a
 * broken result.
 */
export const wrapParagraph = (
	text: string,
	maxWidth: number,
	measure: (text: string) => number,
): string[] => {
	const words = text.split(/\s+/).filter(Boolean)
	if (words.length === 0) return []

	const lines: string[] = []
	let current = ''

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word

		if (measure(candidate) <= maxWidth) {
			current = candidate
			continue
		}

		if (current) {
			lines.push(current)
			current = ''
		}

		if (measure(word) <= maxWidth) {
			current = word
			continue
		}

		// The word alone does not fit: emit it in character-sized chunks and
		// carry the remainder into the next round of wrapping.
		let chunk = ''
		for (const character of word) {
			if (chunk && measure(chunk + character) > maxWidth) {
				lines.push(chunk)
				chunk = ''
			}
			chunk += character
		}
		current = chunk
	}

	if (current) lines.push(current)
	return lines
}

/**
 * The metrics are passed in rather than defaulted, because they differ per
 * canvas format — a Reel has more vertical room than a feed post, so it gets a
 * bigger line budget. Defaulting here would let a caller silently lay a Reel's
 * caption out to the feed's measurements.
 */
export const fitCaption = (
	text: string,
	metrics: CaptionMetrics,
	measure: MeasureText,
): CaptionLayout => {
	const { maxWidth, maxFontSize, minFontSize, lineHeight, maxLines, lineBudget } = metrics

	const empty: CaptionLayout = {
		fontSize: maxFontSize,
		lines: [],
		lineHeight,
		blockHeight: 0,
		truncated: false,
		atMinimumFont: false,
	}

	if (!text.trim()) return empty

	// Manual line breaks are inviolable. Someone who typed five breaks asked for
	// five lines, so let the font shrink rather than merging their lines away.
	const paragraphs = text.split(/\r?\n/)
	const lineLimit = clamp(Math.max(maxLines, paragraphs.length), 1, lineBudget)

	const layoutAt = (fontSize: number): CaptionLayout => {
		const lines: string[] = []

		for (const paragraph of paragraphs) {
			const trimmed = paragraph.trim()
			// A blank line between paragraphs is a deliberate visual break.
			if (!trimmed) {
				lines.push('')
				continue
			}
			lines.push(...wrapParagraph(trimmed, maxWidth, value => measure(value, fontSize)))
		}

		return {
			fontSize,
			lines,
			lineHeight,
			blockHeight: lines.length * fontSize * lineHeight,
			truncated: false,
			atMinimumFont: false,
		}
	}

	/**
	 * Both constraints are checked, because line count alone is not enough.
	 *
	 * A caption of many short manual lines satisfies the line budget while standing
	 * far taller than the canvas — 20 one-line paragraphs at 62px is 1438px against
	 * the feed's 1055px of room — which drew its first lines off the top of the
	 * frame, over the chip, and reported neither `truncated` nor `atMinimumFont`.
	 *
	 * `lineBudget` is derived at the minimum font, which is the one size where
	 * `lines <= lineBudget` already implies the height fits; at every larger size
	 * the height has to be checked separately.
	 */
	const maxBlockHeight = metrics.baselineBottom - metrics.safeTop

	let smallest: CaptionLayout | null = null

	for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
		const layout = layoutAt(fontSize)
		if (layout.lines.length <= lineLimit && layout.blockHeight <= maxBlockHeight) return layout
		smallest = layout
	}

	if (!smallest) return { ...empty, truncated: true, atMinimumFont: true }

	// Even the minimum font size overflows the requested budget. Let the block
	// grow up to the space ceiling rather than cutting the caption down to four
	// lines, and only report `truncated` when lines were genuinely dropped.
	const withinCeiling = smallest.lines.length <= lineBudget
	const lines = withinCeiling ? smallest.lines : smallest.lines.slice(0, lineBudget)

	return {
		...smallest,
		lines,
		blockHeight: lines.length * smallest.fontSize * lineHeight,
		truncated: !withinCeiling,
		// The font is already at its floor, so this caption is as small as it will
		// get — the useful warning for the UI, whether or not lines were dropped.
		atMinimumFont: true,
	}
}
