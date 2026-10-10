import { describe, expect, test } from 'vitest'

import {
	RECORDER_CANDIDATES,
	extensionForMime,
	isMp4,
	pickRecorderFormat,
} from '../../app/utils/workspace/mime'

/** A browser that supports exactly the listed MIME types. */
const supporting = (...supported: string[]) => (mimeType: string): boolean =>
	supported.includes(mimeType)

describe('pickRecorderFormat', () => {
	test('prefers MP4 when the browser supports both containers', () => {
		// The whole point: a browser that can do MP4 must never silently get WebM.
		const format = pickRecorderFormat(supporting('video/webm', 'video/mp4'))

		expect(format?.extension).toBe('mp4')
	})

	test('picks the first supported candidate in preference order', () => {
		const format = pickRecorderFormat(supporting('video/mp4'))

		expect(format?.mimeType).toBe('video/mp4')
		expect(format?.extension).toBe('mp4')
	})

	test('falls back to WebM when MP4 is unavailable, as in Firefox', () => {
		const format = pickRecorderFormat(supporting('video/webm;codecs=vp9,opus'))

		expect(format?.extension).toBe('webm')
		expect(format?.mimeType).toBe('video/webm;codecs=vp9,opus')
	})

	test('returns null when nothing is supported', () => {
		expect(pickRecorderFormat(() => false)).toBeNull()
	})

	test('treats a throwing isTypeSupported as unsupported and keeps looking', () => {
		const flaky = (mimeType: string): boolean => {
			if (mimeType === 'video/mp4') throw new Error('unsupported codec string')
			return mimeType === 'video/webm'
		}

		const format = pickRecorderFormat(flaky)

		expect(format?.mimeType).toBe('video/webm')
	})

	test('never returns a candidate outside the declared list', () => {
		for (const candidate of RECORDER_CANDIDATES) {
			const format = pickRecorderFormat(supporting(candidate))

			expect(format?.mimeType).toBe(candidate)
			expect(RECORDER_CANDIDATES).toContain(format?.mimeType)
		}
	})
})

describe('extensionForMime', () => {
	test('maps the base container, ignoring codec parameters', () => {
		expect(extensionForMime('video/mp4')).toBe('mp4')
		expect(extensionForMime('video/mp4;codecs=avc1.42E01E,mp4a.40.2')).toBe('mp4')
		expect(extensionForMime('video/webm;codecs=vp9,opus')).toBe('webm')
		expect(extensionForMime('VIDEO/MP4')).toBe('mp4')
	})

	test('falls back to a generic extension for anything unrecognised', () => {
		expect(extensionForMime('')).toBe('bin')
		expect(extensionForMime('video/ogg')).toBe('bin')
	})
})

describe('isMp4', () => {
	test('reports whether the negotiated container is MP4', () => {
		expect(isMp4('video/mp4;codecs=avc1')).toBe(true)
		expect(isMp4('video/webm')).toBe(false)
	})
})
