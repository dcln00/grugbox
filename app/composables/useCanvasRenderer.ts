import { MARK_SHAPES, MARK_THEMES } from '~/utils/workspace/mark'
import type { MarkTheme } from '~/utils/workspace/mark'
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from '~/utils/workspace/constants'
import {
	drawBackground,
	drawCanvasBase,
	drawCaption,
	drawChip,
	drawLogo,
	drawScrim,
} from '~/utils/workspace/draw'
import type { LogoShape } from '~/utils/workspace/draw'
import type { CaptionLayout } from '~/utils/workspace/types'

/**
 * Built lazily per colourway and cached. Path2D is immutable and cheap to reuse,
 * and rebuilding it per frame would re-parse the path strings 30 times a second
 * during export.
 */
const buildMark = (theme: MarkTheme): readonly LogoShape[] =>
	MARK_SHAPES.map(shape => ({ path: new Path2D(shape.d), color: MARK_THEMES[theme][shape.tone] }))

const markCache: Partial<Record<MarkTheme, readonly LogoShape[]>> = {}

const getLogoMark = (theme: MarkTheme): readonly LogoShape[] => {
	const cached = markCache[theme]
	if (cached) return cached

	const built = buildMark(theme)
	markCache[theme] = built
	return built
}

/** Everything a single frame needs. Recomputed on change, not per draw. */
export interface Scene {
	/** A decoded HTMLImageElement or a playing HTMLVideoElement. */
	source: CanvasImageSource | null
	sourceWidth: number
	sourceHeight: number
	caption: CaptionLayout
	category: string
	/** Which colourway of the mark to paint. */
	markTheme: MarkTheme
}

export function useCanvasRenderer() {
	const contextFor = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null =>
		canvas.getContext('2d')

	/** Draws one complete frame. Order matters: scrim before text, always. */
	const drawScene = (ctx: CanvasRenderingContext2D, scene: Scene): void => {
		drawCanvasBase(ctx)

		if (scene.source) {
			drawBackground(ctx, scene.source, scene.sourceWidth, scene.sourceHeight)
		}

		drawScrim(ctx)
		drawChip(ctx, scene.category)
		drawLogo(ctx, getLogoMark(scene.markTheme))
		drawCaption(ctx, scene.caption)
	}

	return {
		canvasWidth: CANVAS_WIDTH,
		canvasHeight: CANVAS_HEIGHT,
		contextFor,
		drawScene,
	}
}
