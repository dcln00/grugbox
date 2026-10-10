const FONT_FAMILY_PROBE = '"Google Sans"'
const FONT_TIMEOUT_MS = 3000
/** Forces a real glyph fetch rather than a metrics-only lookup. */
const FONT_PROBE_TEXT = 'Aa'

export function useWorkspaceFonts() {
	const isReady = ref(false)
	const didFail = ref(false)

	const ensureFont = async (): Promise<void> => {
		if (typeof window === 'undefined' || !document.fonts) {
			didFail.value = true
			return
		}

		try {
			const loaded = await Promise.race([
				Promise.all([
					document.fonts.load(`700 16px ${FONT_FAMILY_PROBE}`, FONT_PROBE_TEXT),
					document.fonts.load(`500 16px ${FONT_FAMILY_PROBE}`, FONT_PROBE_TEXT),
				]),
				new Promise<never>((_resolve, reject) => {
					setTimeout(() => reject(new Error('font load timed out')), FONT_TIMEOUT_MS)
				}),
			])

			// document.fonts.load RESOLVES WITH AN EMPTY ARRAY when no @font-face
			// matches the family — it does not reject. The array length is the only
			// reliable availability test; without it a missing font silently
			// produces fallback-metric layouts.
			const faces = loaded.flat()
			isReady.value = faces.length > 0
			didFail.value = faces.length === 0
		} catch (caught: unknown) {
			// Never block the canvas on a slow or unavailable font — fall back to
			// system-ui and let the UI mention that the layout may differ.
			console.warn('[Workspace] Google Sans unavailable, using fallback metrics', caught)
			didFail.value = true
		}
	}

	return { isReady, didFail, ensureFont }
}
