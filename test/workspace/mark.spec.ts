import { describe, expect, test } from 'vitest'

import {
	MARK_SHAPES,
	MARK_THEMES,
	MARK_THEME_OPTIONS,
	MARK_VIEWBOX,
	markThemeLabel,
	resolveMarkTheme,
} from '../../app/utils/workspace/mark'

describe('MARK_SHAPES', () => {
	test('has the three shapes, in paint order, with the base second', () => {
		expect(MARK_SHAPES).toHaveLength(3)
		// The base triangle must be painted between the two body shapes; the third
		// body shape sits on top of it, so reordering changes the mark.
		expect(MARK_SHAPES.map(shape => shape.tone)).toEqual(['body', 'base', 'body'])
	})

	test('every shape is closed SVG path data', () => {
		for (const shape of MARK_SHAPES) {
			expect(shape.d.startsWith('M')).toBe(true)
			expect(shape.d.endsWith('Z')).toBe(true)
			// No NaN from a malformed coordinate list.
			expect(shape.d).not.toMatch(/NaN|undefined/)
		}
	})

	test('is a square viewBox, which is what the canvas sizing assumes', () => {
		expect(MARK_VIEWBOX.width / MARK_VIEWBOX.height).toBeCloseTo(1, 2)
	})
})

describe('MARK_THEMES', () => {
	test('defines both tones for both colourways', () => {
		for (const theme of ['white', 'black'] as const) {
			expect(MARK_THEMES[theme].body).toMatch(/^#[0-9a-f]{6}$/i)
			expect(MARK_THEMES[theme].base).toMatch(/^#[0-9a-f]{6}$/i)
		}
	})

	test('matches the supplied SVGs exactly', () => {
		// Body colours come from the unclassed shapes, base from .cls-1.
		expect(MARK_THEMES.white).toEqual({ body: '#ffffff', base: '#d7d7d7' })
		expect(MARK_THEMES.black).toEqual({ body: '#000000', base: '#161616' })
	})

	test('resolves a colour for every shape in both colourways', () => {
		// Guards against a tone being added to MARK_SHAPES without a colour.
		for (const theme of ['white', 'black'] as const) {
			for (const shape of MARK_SHAPES) {
				expect(MARK_THEMES[theme][shape.tone]).toBeTruthy()
			}
		}
	})
})

describe('resolveMarkTheme', () => {
	test('follows the shared default when a slide has no override', () => {
		expect(resolveMarkTheme(null, 'white')).toBe('white')
		expect(resolveMarkTheme(null, 'black')).toBe('black')
	})

	test('treats undefined the same as null', () => {
		// A slide created before the override existed has no field at all.
		expect(resolveMarkTheme(undefined, 'white')).toBe('white')
		expect(resolveMarkTheme(undefined, 'black')).toBe('black')
	})

	test('a slide override wins over the shared default', () => {
		expect(resolveMarkTheme('black', 'white')).toBe('black')
		expect(resolveMarkTheme('white', 'black')).toBe('white')
	})

	test('changing the default moves every slide that did not opt out', () => {
		// The property that storing null rather than a snapshot exists to protect.
		expect(resolveMarkTheme(null, 'white')).toBe('white')
		expect(resolveMarkTheme(null, 'black')).toBe('black')
	})
})

describe('markThemeLabel and options', () => {
	test('offers exactly the two colourways', () => {
		expect(MARK_THEME_OPTIONS.map(option => option.value)).toEqual(['white', 'black'])
	})

	test('labels each colourway', () => {
		expect(markThemeLabel('white')).toBe('White')
		expect(markThemeLabel('black')).toBe('Black')
	})
})
