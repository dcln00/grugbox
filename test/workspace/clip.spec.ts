import { describe, expect, test } from 'vitest'

import { FEED_FORMAT, REEL_FORMAT } from '../../app/utils/workspace/canvasFormat'
import { TRIMMED_CLIP_SECONDS } from '../../app/utils/workspace/constants'
import { clipEndFor, effectiveClip } from '../../app/utils/workspace/clip'
import type { ClipMode, ClipSource } from '../../app/utils/workspace/types'

const FEED_CAP = FEED_FORMAT.maxClipSeconds
const REEL_CAP = REEL_FORMAT.maxClipSeconds

const source = (overrides: Partial<ClipSource> = {}): ClipSource => ({
	duration: 30,
	clipMode: 'trim',
	...overrides,
})

describe('clipEndFor', () => {
	test('keeps a source shorter than the cap whole', () => {
		expect(clipEndFor(20, FEED_CAP)).toBe(20)
	})

	test('caps a source longer than the platform limit', () => {
		expect(clipEndFor(600, FEED_CAP)).toBe(FEED_CAP)
		expect(clipEndFor(600, REEL_CAP)).toBe(REEL_CAP)
	})

	test.each([
		['zero', 0],
		['NaN', Number.NaN],
		['Infinity', Number.POSITIVE_INFINITY],
		['negative', -1],
	])('falls back to the cap for a %s duration', (_label, duration) => {
		// A fragmented .mov reports one of these before its seekable range is
		// known. Returning 0 would hand the recorder an empty window and stop it
		// on the very first tick.
		expect(clipEndFor(duration, FEED_CAP)).toBe(FEED_CAP)
	})
})

describe('effectiveClip', () => {
	test('trimmed takes the predefined opening of a longer clip', () => {
		expect(effectiveClip(source({ duration: 600 }), FEED_CAP)).toEqual({
			start: 0,
			end: TRIMMED_CLIP_SECONDS,
		})
		expect(effectiveClip(source({ duration: 600 }), REEL_CAP)).toEqual({
			start: 0,
			end: TRIMMED_CLIP_SECONDS,
		})
	})

	test('trimmed leaves a clip that is already shorter than the cut alone', () => {
		expect(effectiveClip(source({ duration: 12 }), FEED_CAP)).toEqual({ start: 0, end: 12 })
	})

	test('trimmed is the same length on both canvases', () => {
		// The rule as agreed: a trimmed cut does not depend on which canvas it is for.
		const feed = effectiveClip(source({ duration: 600 }), FEED_CAP)
		const reel = effectiveClip(source({ duration: 600 }), REEL_CAP)

		expect(feed.end - feed.start).toBe(reel.end - reel.start)
	})

	test('trimmed falls back to the cut when the source length never resolved', () => {
		expect(effectiveClip(source({ duration: 0 }), FEED_CAP)).toEqual({
			start: 0,
			end: TRIMMED_CLIP_SECONDS,
		})
	})

	test('trimmed never exceeds a canvas whose limit sits below the cut', () => {
		// Nothing here has a 10-second limit today; the guard is what stops a future
		// format from exporting longer than its platform accepts.
		expect(effectiveClip(source({ duration: 600 }), 10)).toEqual({ start: 0, end: 10 })
	})

	test('full takes the whole clip, up to the canvas limit', () => {
		expect(effectiveClip(source({ duration: 600, clipMode: 'full' }), FEED_CAP)).toEqual({
			start: 0,
			end: FEED_CAP,
		})
		expect(effectiveClip(source({ duration: 600, clipMode: 'full' }), REEL_CAP)).toEqual({
			start: 0,
			end: REEL_CAP,
		})
	})

	test('full leaves a short clip whole rather than padding it out', () => {
		expect(effectiveClip(source({ duration: 8, clipMode: 'full' }), REEL_CAP)).toEqual({
			start: 0,
			end: 8,
		})
	})

	test('full falls back to the cap when the source length never resolved', () => {
		expect(effectiveClip(source({ duration: 0, clipMode: 'full' }), FEED_CAP)).toEqual({
			start: 0,
			end: FEED_CAP,
		})
	})

	test('both modes start at the beginning, because there is no in-point to set', () => {
		for (const clipMode of ['trim', 'full'] as ClipMode[]) {
			for (const duration of [0, 8, 600]) {
				expect(effectiveClip(source({ duration, clipMode }), FEED_CAP).start).toBe(0)
			}
		}
	})

	test('holds its shape across every mode, cap and duration', () => {
		const durations = [0, 0.4, 8, 30, 60, 180, 900, Number.POSITIVE_INFINITY]
		const modes: ClipMode[] = ['trim', 'full']

		for (const cap of [FEED_CAP, REEL_CAP]) {
			for (const clipMode of modes) {
				for (const duration of durations) {
					const clip = effectiveClip({ duration, clipMode }, cap)

					// The recorder needs a real window: an end at or before the start
					// records nothing at all.
					expect(clip.start).toBe(0)
					expect(clip.end).toBeGreaterThan(clip.start)
					expect(clip.end).toBeLessThanOrEqual(cap)
					expect(Number.isFinite(clip.end)).toBe(true)
				}
			}
		}
	})

	test('is idempotent, because the range is derived rather than stored', () => {
		// There is no stored selection to re-fit on a format switch any more; this
		// pins that re-deriving from a resolved range cannot drift.
		for (const clipMode of ['trim', 'full'] as ClipMode[]) {
			for (const cap of [FEED_CAP, REEL_CAP]) {
				const once = effectiveClip({ duration: 600, clipMode }, cap)
				const twice = effectiveClip({ duration: once.end, clipMode }, cap)

				expect(twice).toEqual(once)
			}
		}
	})
})
