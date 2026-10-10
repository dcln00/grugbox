import type { Rect } from './types'

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max)

/**
 * `object-fit: cover` geometry — the scale that fills the destination, centred so
 * the overflow is cropped evenly.
 *
 * Returns a destination rect, not a source crop: `drawImage` accepts negative
 * x/y happily, so the caller can draw straight into it with no clipping setup.
 */
export const coverRect = (
	srcWidth: number,
	srcHeight: number,
	dstWidth: number,
	dstHeight: number,
): Rect => {
	// A not-yet-decoded video reports 0x0; filling the frame black beats a
	// divide-by-zero that would produce NaN and silently draw nothing.
	if (srcWidth <= 0 || srcHeight <= 0 || dstWidth <= 0 || dstHeight <= 0) {
		return { x: 0, y: 0, width: dstWidth, height: dstHeight }
	}

	const scale = Math.max(dstWidth / srcWidth, dstHeight / srcHeight)
	const width = srcWidth * scale
	const height = srcHeight * scale

	return {
		x: (dstWidth - width) / 2,
		y: (dstHeight - height) / 2,
		width,
		height,
	}
}
