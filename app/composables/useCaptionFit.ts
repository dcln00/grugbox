import { CAPTION_FONT_WEIGHT, CAPTION_MAX_WIDTH, FONT_FAMILY } from '~/utils/workspace/constants'
import { fitCaption } from '~/utils/workspace/caption'
import type { CaptionLayout } from '~/utils/workspace/types'

/**
 * Bridges the pure caption fitter to a real 2D context by supplying the one
 * thing it cannot compute on its own: text measurement.
 *
 * Keeping `measure` injected is what lets `fitCaption` be unit-tested in Node
 * with a deterministic stub.
 */
export function useCaptionFit() {
	const layoutFor = (ctx: CanvasRenderingContext2D, text: string): CaptionLayout =>
		fitCaption(text, { maxWidth: CAPTION_MAX_WIDTH }, (value, fontSize) => {
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
