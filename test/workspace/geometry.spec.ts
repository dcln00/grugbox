import { describe, expect, test } from 'vitest'

import { coverRect } from '../../app/utils/workspace/geometry'

const DST_W = 1080
const DST_H = 1350

describe('coverRect', () => {
	test('fills the frame exactly when the aspect ratio already matches', () => {
		const rect = coverRect(1080, 1350, DST_W, DST_H)

		expect(rect).toEqual({ x: 0, y: 0, width: 1080, height: 1350 })
	})

	test('crops the top and bottom of a taller portrait source', () => {
		// 2:3 portrait into 4:5 — width matches, so only the height overflows.
		const rect = coverRect(1080, 1620, DST_W, DST_H)

		expect(rect.width).toBe(1080)
		expect(rect.height).toBe(1620)
		expect(rect.x).toBe(0)
		expect(rect.y).toBe(-135)
	})

	test('crops the left and right of a landscape source', () => {
		const rect = coverRect(1920, 1080, DST_W, DST_H)

		expect(rect.width).toBe(2400)
		expect(rect.height).toBe(1350)
		expect(rect.x).toBe(-660)
		expect(rect.y).toBe(0)
	})

	test('crops top and bottom of a square source', () => {
		const rect = coverRect(1000, 1000, DST_W, DST_H)

		expect(rect.width).toBe(1350)
		expect(rect.height).toBe(1350)
		expect(rect.x).toBe(-135)
		expect(rect.y).toBe(0)
	})

	test('upscales a source smaller than the canvas', () => {
		const rect = coverRect(540, 675, DST_W, DST_H)

		expect(rect.width).toBe(1080)
		expect(rect.height).toBe(1350)
	})

	test('never leaves a gap in the destination frame', () => {
		const sources: Array<[number, number]> = [
			[1080, 1350],
			[1080, 1620],
			[1920, 1080],
			[1000, 1000],
			[4000, 2250],
			[1, 1],
			[3, 4000],
		]

		for (const [width, height] of sources) {
			const rect = coverRect(width, height, DST_W, DST_H)

			expect(rect.width).toBeGreaterThanOrEqual(DST_W)
			expect(rect.height).toBeGreaterThanOrEqual(DST_H)
			// Centred: the overflow is split evenly, so the offsets are half the
			// excess on each side.
			expect(rect.x).toBeCloseTo((DST_W - rect.width) / 2, 6)
			expect(rect.y).toBeCloseTo((DST_H - rect.height) / 2, 6)
		}
	})

	test('falls back to a full-frame rect when the source has no dimensions', () => {
		// An undecoded video reports 0x0. Without this guard the scale would be
		// Infinity or NaN and the draw would silently produce nothing.
		for (const rect of [
			coverRect(0, 0, DST_W, DST_H),
			coverRect(0, 1080, DST_W, DST_H),
			coverRect(1080, 0, DST_W, DST_H),
		]) {
			expect(rect).toEqual({ x: 0, y: 0, width: DST_W, height: DST_H })
			expect(Number.isFinite(rect.x)).toBe(true)
			expect(Number.isFinite(rect.y)).toBe(true)
		}
	})
})
