import {
	CAPTION_BASELINE_BOTTOM,
	CAPTION_FONT_WEIGHT,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	CHIP_FONT_SIZE,
	CHIP_FONT_WEIGHT,
	CHIP_HEIGHT,
	CHIP_PADDING_X,
	CHIP_RADIUS,
	FONT_FAMILY,
	LOGO_HEIGHT,
	PAGE_MARGIN,
	SCRIM_START_RATIO,
} from './constants'
import { coverRect } from './geometry'
import { GRUGBOX_LOGO_VIEWBOX } from '../logo'
import type { CaptionLayout } from './types'

/**
 * Canvas drawing primitives. Each takes the context as its first argument and
 * holds no state, so they can be exercised from the console and reused by every
 * export path — the preview and the exports all render through these.
 */

const CHIP_FILL = 'rgba(255, 255, 255, 0.28)'
const WHITE = '#ffffff'

const CHIP_FONT = `${CHIP_FONT_WEIGHT} ${CHIP_FONT_SIZE}px ${FONT_FAMILY}`

export const roundedRectPath = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void => {
	// roundRect is Chrome 99+/Safari 16+/Firefox 112+, so the arcTo fallback is
	// belt and braces — but it is six lines and removes a hard floor on browsers.
	if (typeof ctx.roundRect === 'function') {
		ctx.beginPath()
		ctx.roundRect(x, y, width, height, radius)
		return
	}

	const r = Math.min(radius, width / 2, height / 2)

	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.arcTo(x + width, y, x + width, y + height, r)
	ctx.arcTo(x + width, y + height, x, y + height, r)
	ctx.arcTo(x, y + height, x, y, r)
	ctx.arcTo(x, y, x + width, y, r)
	ctx.closePath()
}

/** Fills the frame black, so a slide with no media attached is never transparent. */
export const drawCanvasBase = (ctx: CanvasRenderingContext2D): void => {
	ctx.save()
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
	ctx.fillStyle = '#000000'
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
	ctx.restore()
}

/**
 * Draws an image or video frame with `object-fit: cover`.
 *
 * The caller must confirm the source is decoded first: drawing an undecoded
 * video is a no-op at best and throws InvalidStateError in Firefox at worst.
 */
export const drawBackground = (
	ctx: CanvasRenderingContext2D,
	source: CanvasImageSource,
	sourceWidth: number,
	sourceHeight: number,
): void => {
	const rect = coverRect(sourceWidth, sourceHeight, CANVAS_WIDTH, CANVAS_HEIGHT)
	// Negative x/y are legal here — that is the crop.
	ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height)
}

/**
 * Three stops, not two. A plain two-stop ramp reads as a hard band across a
 * bright photo; the midpoint stop softens the transition into the caption.
 */
export const drawScrim = (ctx: CanvasRenderingContext2D): void => {
	const gradient = ctx.createLinearGradient(
		0,
		CANVAS_HEIGHT * SCRIM_START_RATIO,
		0,
		CANVAS_HEIGHT,
	)

	gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
	gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.45)')
	gradient.addColorStop(1, 'rgba(0, 0, 0, 0.88)')

	ctx.save()
	ctx.fillStyle = gradient
	ctx.fillRect(0, CANVAS_HEIGHT * SCRIM_START_RATIO, CANVAS_WIDTH, CANVAS_HEIGHT)
	ctx.restore()
}

/** Translucent pill at the top-left. No-op for an empty label. */
export const drawChip = (ctx: CanvasRenderingContext2D, label: string): void => {
	const text = label.trim().toUpperCase()
	if (!text) return

	ctx.save()
	ctx.font = CHIP_FONT
	ctx.textBaseline = 'middle'
	ctx.textAlign = 'left'

	const width = ctx.measureText(text).width + CHIP_PADDING_X * 2

	ctx.fillStyle = CHIP_FILL
	roundedRectPath(ctx, PAGE_MARGIN, PAGE_MARGIN, width, CHIP_HEIGHT, CHIP_RADIUS)
	ctx.fill()

	ctx.fillStyle = WHITE
	// Vertically centred on the chip box rather than on the font metrics.
	ctx.fillText(text, PAGE_MARGIN + CHIP_PADDING_X, PAGE_MARGIN + CHIP_HEIGHT / 2)

	ctx.restore()
}

/**
 * The wordmark, drawn from SVG path data via Path2D.
 *
 * Path2D needs no rasterisation: it is synchronous, cannot taint the canvas (so
 * PNG export cannot fail with a SecurityError) and takes its colour from
 * fillStyle — none of the async-load or Safari-0x0 problems an SVG data URL
 * would bring.
 */
export const drawLogo = (ctx: CanvasRenderingContext2D, logo: Path2D): void => {
	const scale = LOGO_HEIGHT / GRUGBOX_LOGO_VIEWBOX.height
	const width = GRUGBOX_LOGO_VIEWBOX.width * scale

	ctx.save()
	ctx.translate(CANVAS_WIDTH - PAGE_MARGIN - width, PAGE_MARGIN + (CHIP_HEIGHT - LOGO_HEIGHT) / 2)
	ctx.scale(scale, scale)
	ctx.fillStyle = WHITE
	ctx.fill(logo)
	ctx.restore()
}

/** White caption, left-aligned, bottom-anchored so the gap below never changes. */
export const drawCaption = (ctx: CanvasRenderingContext2D, layout: CaptionLayout): void => {
	const { fontSize, lines, lineHeight } = layout
	if (lines.length === 0) return

	const step = fontSize * lineHeight
	const firstBaseline = CAPTION_BASELINE_BOTTOM - (lines.length - 1) * step

	ctx.save()
	ctx.font = `${CAPTION_FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`
	ctx.textBaseline = 'alphabetic'
	ctx.textAlign = 'left'
	ctx.fillStyle = WHITE
	// Keeps the caption readable over a bright patch of photo.
	ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
	ctx.shadowBlur = 12
	ctx.shadowOffsetY = 2

	lines.forEach((line, index) => {
		// Empty strings are deliberate paragraph gaps.
		if (!line) return
		ctx.fillText(line, PAGE_MARGIN, firstBaseline + index * step)
	})

	ctx.restore()
}
