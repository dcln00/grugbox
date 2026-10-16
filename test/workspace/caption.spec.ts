import { describe, expect, test } from 'vitest'

import { fitCaption, wrapParagraph } from '../../app/utils/workspace/caption'
import { FEED_FORMAT, REEL_FORMAT } from '../../app/utils/workspace/canvasFormat'
import type { CaptionLayout, CaptionMetrics } from '../../app/utils/workspace/types'

const MAX_WIDTH = 1024

/**
 * The real metrics from the format descriptors, with the measure narrowed for
 * the stub below. Sourcing them from the descriptors rather than hand-copying
 * the numbers is deliberate: copy them and these tests would only ever validate
 * the copy, while the shipping Reel layout went unchecked.
 */
const FEED_METRICS: CaptionMetrics = { ...FEED_FORMAT.caption, maxWidth: MAX_WIDTH }
const REEL_METRICS: CaptionMetrics = { ...REEL_FORMAT.caption, maxWidth: MAX_WIDTH }

/** Deterministic stand-in for `ctx.measureText`: 0.6em per character. */
const measure = (text: string, fontSize: number): number => text.length * fontSize * 0.6

const fit = (text: string, metrics: CaptionMetrics = FEED_METRICS) =>
	fitCaption(text, metrics, measure)

/** A word of `length` characters — used to control wrapping precisely. */
const word = (length: number): string => 'a'.repeat(length)

/** Where the block's top edge lands, for checking it clears the chip and logo. */
const blockTop = (layout: CaptionLayout, metrics: CaptionMetrics): number =>
	metrics.baselineBottom - layout.blockHeight

describe('wrapParagraph', () => {
	test('returns nothing for empty or whitespace-only input', () => {
		expect(wrapParagraph('', MAX_WIDTH, () => 0)).toEqual([])
		expect(wrapParagraph('   ', MAX_WIDTH, () => 0)).toEqual([])
	})

	test('keeps a short paragraph on one line', () => {
		const lines = wrapParagraph('hello world', MAX_WIDTH, text => measure(text, 62))

		expect(lines).toEqual(['hello world'])
	})

	test('breaks a long single token at character level instead of overflowing', () => {
		// The regression this guards: without a character-level fallback the
		// token becomes one infinitely wide line.
		const lines = wrapParagraph(word(200), MAX_WIDTH, text => measure(text, 62))

		expect(lines.length).toBeGreaterThan(1)
		for (const line of lines) {
			expect(measure(line, 62)).toBeLessThanOrEqual(MAX_WIDTH)
		}
		expect(lines.join('')).toBe(word(200))
	})

	test('preserves every word across line breaks', () => {
		const text = 'one two three four five six seven eight nine ten eleven twelve'
		const lines = wrapParagraph(text, MAX_WIDTH, value => measure(value, 62))

		expect(lines.join(' ')).toBe(text)
	})
})

describe('fitCaption', () => {
	test('returns an empty layout for blank input', () => {
		const layout = fit('')

		expect(layout.lines).toEqual([])
		expect(layout.blockHeight).toBe(0)
		expect(layout.truncated).toBe(false)
	})

	test('keeps a short caption at the maximum font size', () => {
		const layout = fit('Jude Dontoh')

		expect(layout.fontSize).toBe(FEED_METRICS.maxFontSize)
		expect(layout.lines).toEqual(['Jude Dontoh'])
		expect(layout.truncated).toBe(false)
	})

	test('keeps a caption that already fits four lines at full size', () => {
		// Four 26-character words: one per line at 62px, so nothing shrinks.
		const layout = fit([word(26), word(26), word(26), word(26)].join(' '))

		expect(layout.fontSize).toBe(FEED_METRICS.maxFontSize)
		expect(layout.lines.length).toBe(4)
	})

	test('shrinks the font when the caption would need more than four lines', () => {
		const layout = fit(Array.from({ length: 8 }, () => word(26)).join(' '))

		expect(layout.lines.length).toBeLessThanOrEqual(4)
		expect(layout.fontSize).toBeLessThan(FEED_METRICS.maxFontSize)
		expect(layout.fontSize).toBeGreaterThanOrEqual(FEED_METRICS.minFontSize)
		expect(layout.truncated).toBe(false)
	})

	test('honours manual line breaks and never merges them away', () => {
		const layout = fit('one\ntwo\nthree\nfour\nfive')

		expect(layout.lines).toEqual(['one', 'two', 'three', 'four', 'five'])
		// Five explicit breaks means the author asked for five lines, so the
		// line budget has to accommodate them.
		expect(layout.truncated).toBe(false)
	})

	test('keeps a blank line between paragraphs as a deliberate visual break', () => {
		const layout = fit('first\n\nsecond')

		expect(layout.lines).toEqual(['first', '', 'second'])
	})

	test('character-breaks a very long unbroken token rather than running away', () => {
		const layout = fit(word(200))

		expect(layout.lines.length).toBeLessThanOrEqual(4)
		for (const line of layout.lines) {
			expect(measure(line, layout.fontSize)).toBeLessThanOrEqual(MAX_WIDTH)
		}
	})

	test('flags truncation and caps lines when even the minimum font overflows', () => {
		// ~2000 characters is more than the feed ceiling can hold at 28px.
		const layout = fit(word(2000))

		expect(layout.truncated).toBe(true)
		expect(layout.atMinimumFont).toBe(true)
		expect(layout.lines.length).toBe(FEED_METRICS.lineBudget)
		expect(layout.fontSize).toBe(FEED_METRICS.minFontSize)
	})

	test('keeps every manual break rather than dropping lines that fit', () => {
		// Regression: a fixed 8-line budget used to silently drop 2 of these 10
		// lines, even though ten short lines at full size sit nowhere near the
		// chip and logo band.
		const layout = fit('one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten')

		expect(layout.lines).toHaveLength(10)
		expect(layout.truncated).toBe(false)
		expect(layout.fontSize).toBe(FEED_METRICS.maxFontSize)
	})

	test('reports atMinimumFont without claiming truncation when nothing was dropped', () => {
		const layout = fit(word(600))

		expect(layout.atMinimumFont).toBe(true)
		expect(layout.truncated).toBe(false)
		expect(layout.fontSize).toBe(FEED_METRICS.minFontSize)
		expect(layout.lines.length).toBeGreaterThan(4)
	})

	test('shrinks the font for a stack of short lines rather than overflowing the frame', () => {
		// Regression: only the line COUNT used to be tested against the budget, so 20
		// short manual lines fitted at 62px and stood 1438px tall in the feed's
		// 1055px of room — the first lines drew off the top of the canvas, over the
		// chip, reporting neither `truncated` nor `atMinimumFont`.
		const twentyLines = Array.from({ length: 20 }, (_, index) => `line ${index}`).join('\n')
		const layout = fit(twentyLines)

		expect(layout.lines).toHaveLength(20)
		expect(layout.fontSize).toBeLessThan(FEED_METRICS.maxFontSize)
		expect(layout.truncated).toBe(false)
		expect(layout.blockHeight).toBeLessThanOrEqual(
			FEED_METRICS.baselineBottom - FEED_METRICS.safeTop,
		)
	})

	test('keeps the block clear of the chip and logo band in every case', () => {
		const captions = ['One', word(200), word(2000), 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj']

		for (const caption of captions) {
			const layout = fit(caption)

			expect(blockTop(layout, FEED_METRICS)).toBeGreaterThanOrEqual(FEED_METRICS.safeTop)
		}
	})

	test('computes block height from the final font size and line count', () => {
		const layout = fit('Jude Dontoh')

		expect(layout.lineHeight).toBe(FEED_METRICS.lineHeight)
		expect(layout.blockHeight).toBeCloseTo(
			layout.lines.length * layout.fontSize * layout.lineHeight,
			6,
		)
	})

	test('gives the taller reel frame a bigger line budget', () => {
		// Same text, two frames: a Reel has the vertical room to keep lines that
		// the feed canvas has to drop.
		const tenLines = 'one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten'

		expect(fit(tenLines, REEL_METRICS).lines).toHaveLength(10)
		expect(REEL_METRICS.lineBudget).toBeGreaterThan(FEED_METRICS.lineBudget)
	})

	test('holds its invariants across a spread of captions in both formats', () => {
		const captions = [
			'One',
			'A much longer headline that has to wrap onto several lines to fit',
			'Kanye West & Lauryn Hill’s Record “I CAN’T WAIT”',
			'line one\nline two',
			'a\nb\nc\nd\ne\nf\ng\nh\ni\nj',
			// The case that only the line-count check let through: many short lines
			// satisfy the budget while standing taller than the frame.
			Array.from({ length: 20 }, (_, index) => `line ${index}`).join('\n'),
			word(50),
			word(3000),
			'mixture of short and ' + word(120) + ' tokens',
			'   ',
		]

		for (const metrics of [FEED_METRICS, REEL_METRICS]) {
			for (const caption of captions) {
				const layout = fit(caption, metrics)

				expect(layout.fontSize).toBeGreaterThanOrEqual(metrics.minFontSize)
				expect(layout.fontSize).toBeLessThanOrEqual(metrics.maxFontSize)
				expect(layout.lines.length).toBeLessThanOrEqual(metrics.lineBudget)

				// Every rendered line must fit the available width, otherwise it would
				// run off the canvas edge.
				for (const line of layout.lines) {
					expect(measure(line, layout.fontSize)).toBeLessThanOrEqual(MAX_WIDTH)
				}

				// The block must never grow upward past its own frame's ceiling, where
				// it would collide with the chip and logo. Asserted against each
				// format's geometry rather than the feed's literal 1200, which said
				// nothing about the taller canvas.
				expect(blockTop(layout, metrics)).toBeGreaterThanOrEqual(metrics.safeTop)
			}
		}
	})
})
