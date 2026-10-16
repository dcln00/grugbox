import { CAPTION_FONT_WEIGHT, FONT_FAMILY } from '~/utils/workspace/constants'
import { fitCaption } from '~/utils/workspace/caption'
import type { CanvasFormat } from '~/utils/workspace/canvasFormat'
import type { CaptionLayout } from '~/utils/workspace/types'

/**
 * Bridges the pure caption fitter to a real 2D context by supplying the one
 * thing it cannot compute on its own: text measurement.
 *
 * Keeping `measure` injected is what lets `fitCaption` be unit-tested in Node
 * with a deterministic stub. The metrics are the active format's — a Reel has
 * more vertical room than a feed post, so the two fit captions differently.
 */
export function useCaptionFit() {
	const layoutFor = (
		ctx: CanvasRenderingContext2D,
		text: string,
		format: CanvasFormat,
	): CaptionLayout =>
		fitCaption(text, format.caption, (value, fontSize) => {
			// measureText reads the context's current font, so set it and restore
			// rather than leaving the context in a font the caller did not expect.
			ctx.save()
			ctx.font = `${CAPTION_FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`
			const width = ctx.measureText(value).width
			ctx.restore()
			return width
		})

	return { layoutFor }
}
