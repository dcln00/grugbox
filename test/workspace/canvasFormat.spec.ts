import { describe, expect, test } from 'vitest'

import {
	CANVAS_FORMATS,
	FEED_FORMAT,
	FORMAT_OPTIONS,
	REEL_FORMAT,
	REEL_UI_BAND,
	lineBudgetFor,
} from '../../app/utils/workspace/canvasFormat'

describe('frame geometry', () => {
	test('each format matches the aspect ratio it advertises', () => {
		expect(FEED_FORMAT.width / FEED_FORMAT.height).toBeCloseTo(4 / 5, 6)
		expect(REEL_FORMAT.width / REEL_FORMAT.height).toBeCloseTo(9 / 16, 6)
	})

	test('both frames are 1080 wide, which is what lets them share a type scale', () => {
		expect(FEED_FORMAT.width).toBe(1080)
		expect(REEL_FORMAT.width).toBe(1080)
		expect(FEED_FORMAT.height).toBe(1350)
		expect(REEL_FORMAT.height).toBe(1920)
	})

	test('the preview class stays a literal Tailwind utility', () => {
		// Built by concatenation the utility would vanish from the stylesheet with
		// no error at all, so the shape is asserted rather than assumed.
		for (const format of FORMAT_OPTIONS) {
			expect(format.previewAspectClass).toMatch(/^aspect-\d+\/\d+$/)
		}

		expect(FEED_FORMAT.previewAspectClass).toBe('aspect-4/5')
		expect(REEL_FORMAT.previewAspectClass).toBe('aspect-9/16')
	})

	test('the picker offers each format exactly once', () => {
		expect(FORMAT_OPTIONS.map(format => format.id)).toEqual(['feed', 'reel'])
		expect(CANVAS_FORMATS.feed).toBe(FEED_FORMAT)
		expect(CANVAS_FORMATS.reel).toBe(REEL_FORMAT)
	})
})

describe('media policy', () => {
	test('the feed takes photos and videos, the reel only videos', () => {
		expect(FEED_FORMAT.accepts).toEqual(['image', 'video'])
		expect(REEL_FORMAT.accepts).toEqual(['video'])
	})

	test('the file input never offers a kind the format would refuse', () => {
		// The two are written by hand, so this is the guard against them drifting.
		for (const format of FORMAT_OPTIONS) {
			expect(format.acceptAttribute.includes('image')).toBe(format.accepts.includes('image'))
			expect(format.acceptAttribute.includes('video')).toBe(format.accepts.includes('video'))
		}
	})

	test('the reel does not offer images', () => {
		expect(REEL_FORMAT.acceptAttribute).toBe('video/*')
	})
})

describe('clip limits', () => {
	test('a reel may run longer than a feed post', () => {
		expect(FEED_FORMAT.maxClipSeconds).toBe(60)
		expect(REEL_FORMAT.maxClipSeconds).toBeGreaterThan(FEED_FORMAT.maxClipSeconds)
	})

	test('every format has a positive cap and copy explaining it', () => {
		for (const format of FORMAT_OPTIONS) {
			expect(format.maxClipSeconds).toBeGreaterThan(0)
			expect(format.clipHint.length).toBeGreaterThan(0)
			expect(format.emptyDeckHint.length).toBeGreaterThan(0)
			expect(format.mediaLabel.length).toBeGreaterThan(0)
		}
	})
})

describe('caption metrics', () => {
	test('every budget is derived from its own frame, not hand-written', () => {
		for (const format of FORMAT_OPTIONS) {
			expect(format.caption.lineBudget).toBe(lineBudgetFor(format.caption))
		}

		// Different frame heights have to yield different budgets, or the
		// derivation is not actually reading the frame.
		expect(REEL_FORMAT.caption.lineBudget).toBeGreaterThan(FEED_FORMAT.caption.lineBudget)
	})

	test('a full block at the budget still fits above the baseline', () => {
		for (const format of FORMAT_OPTIONS) {
			const { lineBudget, minFontSize, lineHeight, safeTop, baselineBottom } = format.caption
			const blockHeight = lineBudget * minFontSize * lineHeight

			expect(blockHeight).toBeLessThanOrEqual(baselineBottom - safeTop)
			expect(baselineBottom - blockHeight).toBeGreaterThanOrEqual(safeTop)
		}
	})

	test('the reel caption clears Instagram’s bottom UI band', () => {
		expect(REEL_FORMAT.caption.baselineBottom).toBeLessThanOrEqual(REEL_FORMAT.height - REEL_UI_BAND)
		// The feed has no such band; it anchors near the bottom edge as before.
		expect(FEED_FORMAT.caption.baselineBottom).toBeLessThan(FEED_FORMAT.height)
	})

	test('the reel caption stops short of the action rail, the feed runs full width', () => {
		const feedGutter = FEED_FORMAT.width - FEED_FORMAT.caption.maxWidth
		const reelGutter = REEL_FORMAT.width - REEL_FORMAT.caption.maxWidth

		expect(reelGutter).toBeGreaterThan(feedGutter)
	})

	test('shares one type scale, so both formats read at the same size', () => {
		const { maxFontSize, minFontSize, lineHeight, maxLines } = FEED_FORMAT.caption

		expect(REEL_FORMAT.caption).toMatchObject({ maxFontSize, minFontSize, lineHeight, maxLines })
		expect(minFontSize).toBeLessThan(maxFontSize)
		expect(lineHeight).toBeGreaterThan(1)
	})

	test('the feed format is still the layout the tool shipped with', () => {
		// A regression pin, not a preference: these are the numbers the 1080x1350
		// output was built and signed off at, before formats existed at all. Moving
		// one changes every feed export, so it should be a deliberate edit here.
		expect(FEED_FORMAT).toMatchObject({
			width: 1080,
			height: 1350,
			maxClipSeconds: 60,
			caption: {
				maxFontSize: 62,
				minFontSize: 28,
				lineHeight: 1.16,
				maxLines: 4,
				safeTop: 140,
				// 155px of photo beneath the text.
				baselineBottom: 1195,
				// Full width, inset by the page margin (40) on both sides.
				maxWidth: 1000,
				lineBudget: 32,
			},
		})
	})
})
