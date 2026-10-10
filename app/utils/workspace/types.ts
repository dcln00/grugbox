export type MediaKind = 'image' | 'video'

export interface Rect {
	x: number
	y: number
	width: number
	height: number
}

/**
 * Measures one line of text at a given font size, in canvas pixels.
 *
 * Injected rather than called directly so caption fitting can be unit-tested in
 * Node with a deterministic stub — no canvas, no font loading.
 */
export type MeasureText = (text: string, fontSize: number) => number

export interface CaptionLayout {
	fontSize: number
	lines: string[]
	lineHeight: number
	blockHeight: number
	/** True when lines were actually dropped because the text could not fit. */
	truncated: boolean
	/** True when the font could not shrink further — a long-caption warning. */
	atMinimumFont: boolean
}

export interface TrimRange {
	/** Seconds. */
	start: number
	/** Seconds. */
	end: number
}

export interface RecorderFormat {
	mimeType: string
	extension: 'mp4' | 'webm' | 'bin'
}
