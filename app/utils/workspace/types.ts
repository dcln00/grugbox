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

/** Whether a video slide exports the team's selected range or the whole clip. */
export type ClipMode = 'trim' | 'full'

/**
 * The part of a video slide that decides what actually gets recorded. Broken out
 * of `WorkspaceSlide` so `clip.ts` can resolve a range without importing a
 * composable.
 */
export interface ClipSource {
	/** Full source length in seconds; 0 when the container is fragmented. */
	duration: number
	clipMode: ClipMode
}

/**
 * Everything about the caption that depends on the frame it sits in.
 *
 * `lineBudget` is derived from the space between `safeTop` and `baselineBottom`,
 * never hand-written — see `captionMetricsFor` in `canvasFormat.ts`.
 */
export interface CaptionMetrics {
	maxFontSize: number
	minFontSize: number
	lineHeight: number
	maxLines: number
	/** The highest the caption block may reach, clear of the chip and logo band. */
	safeTop: number
	/** Baseline of the LAST line. The block grows upward from here. */
	baselineBottom: number
	/** Full-width measure for the caption, inset by the page margin on both sides. */
	maxWidth: number
	/** Derived ceiling on lines, from the space between the two anchors above. */
	lineBudget: number
}

export interface RecorderFormat {
	mimeType: string
	extension: 'mp4' | 'webm' | 'bin'
}
