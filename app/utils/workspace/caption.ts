import {
	CAPTION_LINE_BUDGET,
	CAPTION_LINE_HEIGHT,
	CAPTION_MAX_FONT_SIZE,
	CAPTION_MAX_LINES,
	CAPTION_MIN_FONT_SIZE,
} from './constants'
import { clamp } from './geometry'
import type { CaptionLayout, MeasureText } from './types'

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

export interface FitCaptionOptions {
	maxWidth: number
	maxFontSize?: number
	minFontSize?: number
	lineHeight?: number
	maxLines?: number
	lineBudget?: number
}

export const fitCaption = (
	text: string,
	options: FitCaptionOptions,
	measure: MeasureText,
): CaptionLayout => {
	const {
		maxWidth,
		maxFontSize = CAPTION_MAX_FONT_SIZE,
		minFontSize = CAPTION_MIN_FONT_SIZE,
		lineHeight = CAPTION_LINE_HEIGHT,
		maxLines = CAPTION_MAX_LINES,
		lineBudget = CAPTION_LINE_BUDGET,
	} = options

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

	// Line count is the constraint; font size is the output. Shrinking the font
	// also shrinks the line box, so fitting the line budget fits the height too —
	// no second constraint check needed.
	let smallest: CaptionLayout | null = null

	for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
		const layout = layoutAt(fontSize)
		if (layout.lines.length <= lineLimit) return layout
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
