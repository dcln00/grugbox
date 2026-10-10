/** Safari needs the object URL to outlive the click, so revoke late rather than immediately. */
const REVOKE_DELAY_MS = 10_000

export const downloadBlob = (blob: Blob, fileName: string): void => {
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')

	anchor.href = url
	anchor.download = fileName
	anchor.style.display = 'none'

	document.body.appendChild(anchor)
	anchor.click()
	anchor.remove()

	setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}

/**
 * Waits for the browser to actually paint, twice — one frame to let reactive
 * state flush into a draw, a second to let that draw reach the compositor.
 * Needed between slides in a carousel export.
 */
export const nextPaint = (): Promise<void> =>
	new Promise(resolve => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	})
