import { MIME_PNG } from '~/utils/workspace/constants'

export function usePngExport() {
	/**
	 * The canvas backing store is already the export resolution in both formats
	 * (1080×1350 and 1080×1920), so there is no rescaling — what you see is what
	 * downloads.
	 */
	const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
		new Promise((resolve, reject) => {
			canvas.toBlob(blob => {
				if (blob) resolve(blob)
				else reject(new Error('The browser could not encode the PNG.'))
			}, MIME_PNG)
		})

	return { toBlob }
}
