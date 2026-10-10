import { useSlideDeck } from '~/composables/useSlideDeck'
import { useCaptionFit } from '~/composables/useCaptionFit'
import { useCanvasRenderer } from '~/composables/useCanvasRenderer'
import { useWorkspaceFonts } from '~/composables/useWorkspaceFonts'
import { useRecentCategories } from '~/composables/useRecentCategories'
import { normalizeCategory } from '~/utils/workspace/categories'

const loadedData = (video: HTMLVideoElement): Promise<void> =>
	new Promise(resolve => {
		const done = (): void => {
			video.removeEventListener('loadeddata', done)
			resolve()
		}
		video.addEventListener('loadeddata', done)
	})

/**
 * Ties the deck, the caption model and the canvas together.
 *
 * Redraw strategy: a still image is drawn only when something changes, while a
 * video slide runs a requestAnimationFrame loop.
 *
 * rAF rather than requestVideoFrameCallback — deliberately. rVFC only fires for
 * an element the compositor is actually presenting, so a hidden or occluded
 * video silently never calls back. That is a footgun for no real gain here:
 * captureStream samples the canvas at a fixed rate regardless, so drawing a
 * frame twice costs a little CPU and changes nothing about the output.
 */
export function useWorkspaceStudio() {
	const deck = useSlideDeck()
	const { ensureFont, didFail: fontFailed } = useWorkspaceFonts()
	const { contextFor, drawScene, canvasWidth, canvasHeight } = useCanvasRenderer()
	const { layoutFor } = useCaptionFit()
	const { recents, suggestions, remember } = useRecentCategories()

	const canvasEl = shallowRef<HTMLCanvasElement | null>(null)
	const videoEl = shallowRef<HTMLVideoElement | null>(null)

	const caption = ref('')
	const category = ref('')
	const status = ref('')

	/** Reported back from the last draw so the UI can warn about an overlong caption. */
	const captionInfo = ref({ fontSize: 0, lines: 0, truncated: false, atMinimumFont: false })

	let pendingFrame = 0
	let loopHandle = 0

	/** Per-slide override wins when set; otherwise the shared caption applies. */
	const activeCaption = computed(() => {
		const slide = deck.activeSlide.value
		if (slide?.captionOverride.trim()) return slide.captionOverride
		return caption.value
	})

	const activeSlide = deck.activeSlide

	const hasMedia = computed(() => {
		const slide = activeSlide.value
		if (!slide) return false
		return slide.kind === 'image' ? !!slide.image : !!videoEl.value
	})

	const draw = (): void => {
		const canvas = canvasEl.value
		if (!canvas) return

		const ctx = contextFor(canvas)
		if (!ctx) return

		const slide = activeSlide.value
		let source: CanvasImageSource | null = null
		let sourceWidth = 0
		let sourceHeight = 0

		if (slide?.kind === 'image' && slide.image) {
			// An image that has not decoded yet reports naturalWidth 0; drawing it
			// would leave the frame black.
			if (slide.image.complete && slide.image.naturalWidth > 0) {
				source = slide.image
				sourceWidth = slide.width
				sourceHeight = slide.height
			}
		} else if (slide?.kind === 'video') {
			const video = videoEl.value
			// readyState >= 2 means a frame is decoded. Below that, drawImage is a
			// no-op at best and throws InvalidStateError in Firefox at worst.
			if (video && video.readyState >= 2) {
				source = video
				sourceWidth = video.videoWidth
				sourceHeight = video.videoHeight
			}
		}

		const layout = layoutFor(ctx, activeCaption.value)
		const didChange =
			captionInfo.value.fontSize !== layout.fontSize ||
			captionInfo.value.lines !== layout.lines.length ||
			captionInfo.value.truncated !== layout.truncated ||
			captionInfo.value.atMinimumFont !== layout.atMinimumFont

		if (didChange) {
			captionInfo.value = {
				fontSize: layout.fontSize,
				lines: layout.lines.length,
				truncated: layout.truncated,
				atMinimumFont: layout.atMinimumFont,
			}
		}

		drawScene(ctx, {
			source,
			sourceWidth,
			sourceHeight,
			caption: layout,
			category: category.value,
		})
	}

	/** Coalesces any number of state changes into a single frame. */
	const invalidate = (): void => {
		if (pendingFrame) return
		pendingFrame = requestAnimationFrame(() => {
			pendingFrame = 0
			draw()
		})
	}

	const stopLoop = (): void => {
		if (loopHandle) cancelAnimationFrame(loopHandle)
		loopHandle = 0
	}

	const startLoop = (): void => {
		stopLoop()
		const tick = (): void => {
			draw()
			loopHandle = requestAnimationFrame(tick)
		}
		loopHandle = requestAnimationFrame(tick)
	}

	/** Keeps playback inside the trim window so the preview shows the exported section. */
	const onTimeUpdate = (): void => {
		const video = videoEl.value
		const slide = activeSlide.value
		if (!video || slide?.kind !== 'video') return
		if (slide.trim.end > 0 && video.currentTime >= slide.trim.end) {
			video.currentTime = slide.trim.start
		}
	}

	const syncVideo = async (): Promise<void> => {
		const video = videoEl.value
		if (!video) return

		const slide = activeSlide.value

		if (slide?.kind !== 'video') {
			video.pause()
			stopLoop()
			invalidate()
			return
		}

		if (video.getAttribute('src') !== slide.objectUrl) {
			video.src = slide.objectUrl
			await loadedData(video)
		}

		video.currentTime = slide.trim.start
		startLoop()

		try {
			// The element is muted for preview, so autoplay policy allows this.
			await video.play()
		} catch (caught: unknown) {
			console.warn('[Workspace] preview playback blocked', caught)
		}
	}

	const onVisibilityChange = (): void => {
		if (document.hidden) {
			stopLoop()
			return
		}
		if (activeSlide.value?.kind === 'video') startLoop()
		else invalidate()
	}

	onMounted(async () => {
		await ensureFont()
		document.addEventListener('visibilitychange', onVisibilityChange)
		await syncVideo()
		invalidate()
	})

	onBeforeUnmount(() => {
		document.removeEventListener('visibilitychange', onVisibilityChange)
		if (pendingFrame) cancelAnimationFrame(pendingFrame)
		stopLoop()
	})

	// Any of these changing should repaint exactly once.
	watch(
		[activeCaption, category, activeSlide],
		() => {
			invalidate()
		},
		{ deep: true },
	)

	watch(activeSlide, async () => {
		await syncVideo()
	})

	watch(
		() => deck.slides.value.map(slide => slide.objectUrl).join(','),
		() => invalidate(),
	)

	const commitCategory = (): void => {
		category.value = normalizeCategory(category.value)
		remember(category.value)
	}

	return {
		...deck,
		canvasEl,
		videoEl,
		canvasWidth,
		canvasHeight,
		caption,
		category,
		status,
		captionInfo,
		fontFailed,
		suggestions,
		recents,
		activeCaption,
		hasMedia,
		draw,
		invalidate,
		startLoop,
		stopLoop,
		onTimeUpdate,
		commitCategory,
	}
}
