import { MIME_PNG } from '~/utils/workspace/constants'

export function usePngExport() {
	/** The canvas is already 1080x1350, so there is no rescaling — what you see is what downloads. */
	const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
		new Promise((resolve, reject) => {
			canvas.toBlob(blob => {
				if (blob) resolve(blob)
				else reject(new Error('The browser could not encode the PNG.'))
			}, MIME_PNG)
		})

	return { toBlob }
}
