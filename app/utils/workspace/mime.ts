import type { RecorderFormat } from './types'

/**
 * Ordered by preference. MP4 first because it is what Instagram accepts
 * reliably; MediaRecorder can produce it in Safari and Chrome 130+, but not in
 * Firefox, which falls through to WebM.
 */
export const RECORDER_CANDIDATES: readonly string[] = [
	'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
	'video/mp4;codecs=avc1,mp4a.40.2',
	'video/mp4',
	'video/webm;codecs=vp9,opus',
	'video/webm;codecs=vp8,opus',
	'video/webm',
]

export const extensionForMime = (mimeType: string): 'mp4' | 'webm' | 'bin' => {
	const base = (mimeType.split(';')[0] ?? '').trim().toLowerCase()
	if (base === 'video/mp4') return 'mp4'
	if (base === 'video/webm') return 'webm'
	return 'bin'
}

export const isMp4 = (mimeType: string): boolean => extensionForMime(mimeType) === 'mp4'

/**
 * First candidate the browser will actually record. `null` means it cannot
 * record video at all — the UI must say so rather than offering a dead button.
 */
export const pickRecorderFormat = (
	isSupported: (mimeType: string) => boolean,
): RecorderFormat | null => {
	for (const candidate of RECORDER_CANDIDATES) {
		let supported = false
		try {
			supported = isSupported(candidate)
		} catch {
			// Some engines throw on unusual codec strings instead of returning
			// false. Treat that as "not supported" and keep looking.
			supported = false
		}
		if (supported) {
			return { mimeType: candidate, extension: extensionForMime(candidate) }
		}
	}
	return null
}
