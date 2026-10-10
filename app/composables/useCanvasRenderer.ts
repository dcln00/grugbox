import { GRUGBOX_LOGO_PATHS } from '~/utils/logo'
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
import type { CaptionLayout } from '~/utils/workspace/types'

/**
 * Built once and cached. Path2D is immutable and cheap to reuse, and building it
 * per frame would re-parse seven path strings 30 times a second during export.
 */
let cachedLogoPath: Path2D | null = null

const getLogoPath = (): Path2D => {
	if (!cachedLogoPath) {
		const path = new Path2D()
		for (const definition of GRUGBOX_LOGO_PATHS) path.addPath(new Path2D(definition))
		cachedLogoPath = path
	}
	return cachedLogoPath
}

/** Everything a single frame needs. Recomputed on change, not per draw. */
export interface Scene {
	/** A decoded HTMLImageElement or a playing HTMLVideoElement. */
	source: CanvasImageSource | null
	sourceWidth: number
	sourceHeight: number
	caption: CaptionLayout
	category: string
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
		drawLogo(ctx, getLogoPath())
		drawCaption(ctx, scene.caption)
	}

	return {
		canvasWidth: CANVAS_WIDTH,
		canvasHeight: CANVAS_HEIGHT,
		contextFor,
		drawScene,
	}
}
