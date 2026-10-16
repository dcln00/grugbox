import { TRIMMED_CLIP_SECONDS } from './constants'
import type { ClipSource, TrimRange } from './types'

/**
 * The end of a whole-clip export, as far as the platform allows.
 *
 * A fragmented container reports 0 or Infinity before its seekable range is
 * known — see `resolveDuration` in `useMediaLoader`. Returning 0 would hand the
 * recorder an empty window, so an unusable duration falls back to the cap. That
 * cap is a ceiling rather than a commitment: the exporter also stops on
 * `video.ended`, so a 20-second file that reports no duration records 20 seconds,
 * not the whole cap.
 */
export const clipEndFor = (duration: number, maxClipSeconds: number): number => {
	if (!Number.isFinite(duration) || duration <= 0) return maxClipSeconds
	return Math.min(duration, maxClipSeconds)
}

/**
 * The range that is actually previewed and exported.
 *
 * Both modes are predefined and always start at the beginning of the clip, which
 * is why nothing here reads a stored selection: `trimmed` is the opening
 * `TRIMMED_CLIP_SECONDS` and `full` is the whole clip up to the canvas limit.
 * There is no in-point to keep track of, so there is nothing that can fall out of
 * step with the cap when the canvas changes.
 *
 * The preview loop and the export both read this, which is what keeps the looping
 * preview showing exactly the section that downloads.
 */
export const effectiveClip = (source: ClipSource, maxClipSeconds: number): TrimRange => {
	if (source.clipMode === 'full') {
		return { start: 0, end: clipEndFor(source.duration, maxClipSeconds) }
	}

	// A canvas whose limit sat below the predefined cut would otherwise export
	// longer than the platform accepts.
	const length = Math.min(TRIMMED_CLIP_SECONDS, maxClipSeconds)

	return { start: 0, end: clipEndFor(source.duration, length) }
}
