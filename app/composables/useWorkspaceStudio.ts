import { useLocalStorage } from '@vueuse/core'

import { useSlideDeck } from '~/composables/useSlideDeck'
import { useCaptionFit } from '~/composables/useCaptionFit'
import { useCanvasRenderer } from '~/composables/useCanvasRenderer'
import { useWorkspaceFonts } from '~/composables/useWorkspaceFonts'
import { useRecentCategories } from '~/composables/useRecentCategories'
import { normalizeCategory } from '~/utils/workspace/categories'
import { CANVAS_FORMATS, FEED_FORMAT } from '~/utils/workspace/canvasFormat'
import { effectiveClip } from '~/utils/workspace/clip'
import { resolveMarkTheme } from '~/utils/workspace/mark'
import type { CanvasFormat, FormatId } from '~/utils/workspace/canvasFormat'
import type { MarkTheme } from '~/utils/workspace/mark'
import type { TrimRange } from '~/utils/workspace/types'

const MARK_THEME_KEY = 'grugbox_workspace_mark_theme'

/**
 * How long to wait for a video's first frame before giving up on `loadeddata`.
 *
 * A file the probe element accepted can still fail to produce a frame in the
 * shared element, and an unresolved promise would leave the preview stuck with
 * the loop never started. Timing out lets the loop run; the loading panel stays
 * up until a frame genuinely arrives.
 */
const FRAME_LOAD_TIMEOUT_MS = 10_000

/** Resolves on `loadeddata`, or after a timeout, so its caller can never hang. */
const loadedData = (video: HTMLVideoElement): Promise<void> =>
	new Promise(resolve => {
		const done = (): void => {
			video.removeEventListener('loadeddata', done)
			window.clearTimeout(timer)
			resolve()
		}
		// Assigned before the listener is attached, so `done` can never run early.
		const timer = window.setTimeout(done, FRAME_LOAD_TIMEOUT_MS)
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
	const { contextFor, drawScene } = useCanvasRenderer()
	const { layoutFor } = useCaptionFit()
	const { recents, suggestions, remember } = useRecentCategories()

	const canvasEl = shallowRef<HTMLCanvasElement | null>(null)
	const videoEl = shallowRef<HTMLVideoElement | null>(null)

	const caption = ref('')
	const category = ref('')
	const status = ref('')

	/**
	 * The canvas being composed.
	 *
	 * Session state rather than persisted, unlike the mark colourway: it
	 * describes the post in hand, and a stale value would silently restrict the
	 * file picker on the next visit.
	 *
	 * A `shallowRef`, not a `ref`: the descriptors are shared module constants, so
	 * proxying one deeply would let a stray write through `format.value` mutate
	 * the format itself. Nothing mutates a format — they are swapped wholesale.
	 */
	const format = shallowRef<CanvasFormat>(FEED_FORMAT)

	/**
	 * The SHARED default colourway of the mark. Persisted because it is a
	 * preference rather than part of a draft — it tends to follow the team's
	 * photography, not a single post. Individual slides may override it.
	 */
	const storedMarkTheme = useLocalStorage<MarkTheme>(MARK_THEME_KEY, 'white')

	// Reads are validated rather than trusted: a hand-edited localStorage value
	// would otherwise reach the renderer as an unknown theme key.
	const defaultMarkTheme = computed<MarkTheme>({
		get: () => (storedMarkTheme.value === 'black' ? 'black' : 'white'),
		set: (value: MarkTheme) => {
			storedMarkTheme.value = value
		},
	})

	/** Reported back from the last draw so the UI can warn about an overlong caption. */
	const captionInfo = ref({ fontSize: 0, lines: 0, truncated: false, atMinimumFont: false })

	/**
	 * True while the active video slide has no decoded frame to show yet.
	 *
	 * Drives a loading panel over the preview, which would otherwise be a black
	 * rectangle with the caption floating on it.
	 */
	const isPreparingFrame = ref(false)

	let pendingFrame = 0
	let loopHandle = 0

	/** Per-slide override wins when set; otherwise the shared caption applies. */
	const activeCaption = computed(() => {
		const slide = deck.activeSlide.value
		if (slide?.captionOverride.trim()) return slide.captionOverride
		return caption.value
	})

	const activeSlide = deck.activeSlide

	/** The colourway actually painted: the slide's own override, else the default. */
	const activeMarkTheme = computed<MarkTheme>(() =>
		resolveMarkTheme(activeSlide.value?.markThemeOverride, defaultMarkTheme.value),
	)

	const hasMedia = computed(() => {
		const slide = activeSlide.value
		if (!slide) return false
		return slide.kind === 'image' ? !!slide.image : !!videoEl.value
	})

	/**
	 * Formats the deck cannot currently be rendered in, mapped to the reason.
	 *
	 * A photo has no way to render on the 9:16 canvas, so the switch is refused
	 * while any are attached rather than silently dropping the team's work.
	 */
	const blockedFormats = computed<Partial<Record<FormatId, string>>>(() => {
		const photos = deck.slides.value.filter(slide => slide.kind === 'image').length
		if (photos === 0) return {}

		const noun = photos === 1 ? 'photo' : 'photos'
		const pronoun = photos === 1 ? 'it' : 'them'

		return {
			reel: `${photos} ${noun} attached, and Reels are video only — remove ${pronoun} to use this canvas.`,
		}
	})

	const setFormat = (id: FormatId): void => {
		if (id === format.value.id) return

		/**
		 * Attaching is asynchronous — each file decodes before it lands in the
		 * deck — so a switch mid-attach would apply the NEW format to files already
		 * accepted under the old one's policy, and a photo could end up on a Reel.
		 * The picker is disabled while loading for the same reason.
		 */
		if (deck.isLoading.value) return

		const blocked = blockedFormats.value[id]
		if (blocked) {
			// Defence in depth — the picker disables the button, but a format change
			// must not quietly drop slides by any other route either.
			deck.error.value = blocked
			return
		}

		format.value = CANVAS_FORMATS[id]
		deck.error.value = ''
	}

	/** Writable view of `format` for the picker's `v-model`. */
	const formatId = computed<FormatId>({
		get: () => format.value.id,
		set: (value: FormatId) => {
			setFormat(value)
		},
	})

	/**
	 * The range the PREVIEW loops.
	 *
	 * The export resolves the same range per slide at its call site instead: a
	 * carousel walks every slide, so it must not read the selection's state.
	 */
	const activeClip = computed<TrimRange | null>(() => {
		const slide = activeSlide.value
		if (slide?.kind !== 'video') return null
		return effectiveClip(slide, format.value.maxClipSeconds)
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

		/**
		 * A slide with nothing drawable is not painted at all.
		 *
		 * `drawScene` fills the frame black before anything else, so painting a video
		 * with no decoded frame — while a clip loads, and for a moment on every seek
		 * as a trimmed clip loops back to its start — produced the black screen with
		 * the caption drawn over it. Returning leaves the last good frame in place.
		 * An empty deck still paints, so the chip and caption stay previewable with
		 * no media attached.
		 */
		if (slide && !source) return

		// A frame is genuinely on the canvas, so the loading panel can go.
		if (source && isPreparingFrame.value) isPreparingFrame.value = false

		const layout = layoutFor(ctx, activeCaption.value, format.value)
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
			markTheme: activeMarkTheme.value,
			format: format.value,
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

	/** Keeps playback inside the clip window so the preview shows the exported section. */
	const onTimeUpdate = (): void => {
		const video = videoEl.value
		const clip = activeClip.value
		if (!video || !clip) return
		if (video.currentTime >= clip.end) video.currentTime = clip.start
	}

	const syncVideo = async (): Promise<void> => {
		const video = videoEl.value
		if (!video) return

		const slide = activeSlide.value

		if (slide?.kind !== 'video') {
			video.pause()
			isPreparingFrame.value = false
			stopLoop()
			invalidate()
			return
		}

		if (video.getAttribute('src') !== slide.objectUrl) {
			// Raised before the await so the panel covers the whole load, and cleared
			// by `draw` once a real frame has reached the canvas.
			isPreparingFrame.value = true
			video.src = slide.objectUrl
			await loadedData(video)
		}

		video.currentTime = activeClip.value?.start ?? 0
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
		[activeCaption, category, activeSlide, activeMarkTheme],
		() => {
			invalidate()
		},
		{ deep: true },
	)

	/**
	 * A format switch redraws directly rather than through `invalidate`.
	 *
	 * The canvas's width/height attributes are only patched on the next tick, and
	 * assigning either clears the backing store — so the draw has to wait for that
	 * flush and then paint straight away, or the preview flashes black for a
	 * frame. A `flush: 'sync'` watcher would be worse still: it would render the
	 * new frame size into the old backing store.
	 */
	watch(format, async () => {
		await nextTick()
		draw()
	})

	watch(activeSlide, async () => {
		await syncVideo()
	})

	/**
	 * Re-seeks when the clip window moves under an already-playing element.
	 *
	 * `onTimeUpdate` only wraps at the out-point, so an in-point that moves forward
	 * — dragging the slider, toggling "full video", or a format switch re-fitting
	 * the selection — would leave the preview playing material that is never
	 * recorded. Handled here rather than per timeupdate so a seek still settling
	 * cannot trigger another on every frame.
	 */
	watch(activeClip, clip => {
		const video = videoEl.value
		if (!video || !clip) return

		if (video.currentTime < clip.start || video.currentTime >= clip.end) {
			video.currentTime = clip.start
		}
	})

	watch(
		() => deck.slides.value.map(slide => slide.objectUrl).join(','),
		() => invalidate(),
	)

	const commitCategory = (): void => {
		category.value = normalizeCategory(category.value)
		remember(category.value)
	}

	/** Attaches files under the active canvas's rules — a Reel takes video only. */
	const addFiles = async (files: File[]): Promise<void> => {
		await deck.addFiles(files, { accepts: format.value.accepts })
	}

	return {
		...deck,
		canvasEl,
		videoEl,
		caption,
		category,
		status,
		captionInfo,
		format,
		formatId,
		blockedFormats,
		activeClip,
		isPreparingFrame,
		setFormat,
		defaultMarkTheme,
		activeMarkTheme,
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
		addFiles,
	}
}
