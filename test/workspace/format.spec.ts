import { describe, expect, test } from 'vitest'

import { buildFileName, formatDuration, slugify } from '../../app/utils/workspace/format'

describe('formatDuration', () => {
	test.each([
		[0, '0:00'],
		[7, '0:07'],
		[59, '0:59'],
		[60, '1:00'],
		[61, '1:01'],
		[754, '12:34'],
	])('formats %i seconds as %s', (seconds, expected) => {
		expect(formatDuration(seconds)).toBe(expected)
	})

	test('truncates fractional seconds rather than rounding up', () => {
		expect(formatDuration(6.9)).toBe('0:06')
	})

	test.each([
		['negative', -5],
		['NaN', Number.NaN],
		['Infinity', Number.POSITIVE_INFINITY],
	])('handles a %s duration without producing NaN in the UI', (_label, seconds) => {
		expect(formatDuration(seconds)).toBe('0:00')
	})
})

describe('slugify', () => {
	test('lowercases and hyphenates', () => {
		expect(slugify('Jude Dontoh Vocals')).toBe('jude-dontoh-vocals')
	})

	test('drops apostrophes rather than hyphenating them', () => {
		expect(slugify("Kanye West's Vocals")).toBe('kanye-wests-vocals')
		expect(slugify('Kanye West’s Vocals')).toBe('kanye-wests-vocals')
	})

	test('collapses runs of punctuation and whitespace into one hyphen', () => {
		expect(slugify('Kanye West & Lauryn Hill — "I CAN’T WAIT"')).toBe(
			'kanye-west-lauryn-hill-i-cant-wait',
		)
	})

	test('strips accents', () => {
		expect(slugify('Café Nocturne')).toBe('cafe-nocturne')
	})

	test('drops emoji', () => {
		expect(slugify('New drop \u{1F525}')).toBe('new-drop')
	})

	test('never leaves leading or trailing hyphens', () => {
		expect(slugify('  --hello--  ')).toBe('hello')
	})

	test('falls back for input with nothing sluggable', () => {
		// A non-Latin caption reduces to nothing; the filename still needs a stem.
		expect(slugify('\u{1F600}\u{1F600}')).toBe('post')
		expect(slugify('')).toBe('post')
	})

	test('caps the length and does not end on a hyphen after trimming', () => {
		const slug = slugify('word '.repeat(60))

		expect(slug.length).toBeLessThanOrEqual(60)
		expect(slug.endsWith('-')).toBe(false)
	})
})

describe('buildFileName', () => {
	test('omits the index for a single-slide export', () => {
		expect(buildFileName('MUSIC', 'Jude Dontoh Vocals', 0, 1, 'png')).toBe(
			'grugbox-music-jude-dontoh-vocals.png',
		)
	})

	test('zero-pads the index for carousel exports so files sort in order', () => {
		expect(buildFileName('MUSIC', 'Jude Dontoh', 0, 10, 'png')).toBe(
			'grugbox-music-jude-dontoh-01.png',
		)
		expect(buildFileName('MUSIC', 'Jude Dontoh', 9, 10, 'png')).toBe(
			'grugbox-music-jude-dontoh-10.png',
		)
	})

	test('works without a category or a caption', () => {
		expect(buildFileName('', '', 0, 1, 'png')).toBe('grugbox.png')
		expect(buildFileName('  ', '  ', 0, 1, 'png')).toBe('grugbox.png')
	})

	test('uses the extension it is given, so a WebM fallback is not mislabelled', () => {
		expect(buildFileName('MUSIC', 'Clip', 0, 1, 'webm')).toBe('grugbox-music-clip.webm')
	})
})
