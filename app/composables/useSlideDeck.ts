import { MAX_SLIDES } from '~/utils/workspace/constants'
import { kindForFile } from '~/utils/workspace/fileKind'
import { useMediaLoader } from '~/composables/useMediaLoader'
import type { ClipMode, MediaKind } from '~/utils/workspace/types'
import type { MarkTheme } from '~/utils/workspace/mark'

export interface WorkspaceSlide {
	id: string
	kind: MediaKind
	fileName: string
	objectUrl: string
	/** Decoded element for image slides. Video slides draw from the shared <video>. */
	image: HTMLImageElement | null
	width: number
	height: number
	/** Seconds. 0 for images. */
	duration: number
	/** The predefined trimmed cut, or the whole clip. Resolved by `effectiveClip`. */
	clipMode: ClipMode
	/** Empty means "use the shared caption". */
	captionOverride: string
	/** `null` means "use the shared mark colourway". */
	markThemeOverride: MarkTheme | null
}

/**
 * What the active canvas will accept.
 *
 * The deck needs only this: how long a clip is allowed to be is decided by
 * `effectiveClip` at preview and export time from the format itself, so nothing
 * about the clip policy has to be stored per slide.
 */
export interface AttachPolicy {
	accepts: readonly MediaKind[]
}

export function useSlideDeck() {
	const { loadImageFile, loadVideoFile } = useMediaLoader()

	// crypto.randomUUID needs a secure context; a plain-http deploy would not have it.
	let idCounter = 0
	const nextId = (): string => {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID()
		}
		idCounter += 1
		return `slide-${Date.now()}-${idCounter}`
	}

	const slides = ref<WorkspaceSlide[]>([])
	const activeIndex = ref(0)
	const isLoading = ref(false)
	const error = ref('')

	const activeSlide = computed<WorkspaceSlide | null>(
		() => slides.value[activeIndex.value] ?? null,
	)

	const isFull = computed(() => slides.value.length >= MAX_SLIDES)

	const releaseSlide = (slide: WorkspaceSlide): void => {
		URL.revokeObjectURL(slide.objectUrl)
		if (slide.image) slide.image.src = ''
	}

	const addFiles = async (files: File[], policy: AttachPolicy): Promise<void> => {
		if (files.length === 0) return

		error.value = ''
		isLoading.value = true

		const room = MAX_SLIDES - slides.value.length
		if (room <= 0) {
			error.value = `A carousel holds at most ${MAX_SLIDES} slides. Remove one to add another.`
			isLoading.value = false
			return
		}

		// Collected and reported together. Writing `error` inside the loop meant a
		// later message silently replaced an earlier one, so a rejected file could
		// vanish without the team ever seeing why.
		const problems: string[] = []

		for (const file of files.slice(0, room)) {
			const kind = kindForFile(file)

			if (!kind) {
				problems.push(`“${file.name}” is not an image or a video.`)
				continue
			}

			// The Reel canvas takes video only. Refusing up front beats attaching a
			// slide the active format has no way to render.
			if (!policy.accepts.includes(kind)) {
				const noun = kind === 'image' ? 'photo' : 'video'
				problems.push(`“${file.name}” is a ${noun}, which this canvas does not take.`)
				continue
			}

			try {
				if (kind === 'image') {
					const loaded = await loadImageFile(file)
					slides.value.push({
						id: nextId(),
						kind,
						fileName: file.name,
						objectUrl: loaded.objectUrl,
						image: loaded.image,
						width: loaded.width,
						height: loaded.height,
						duration: 0,
						clipMode: 'trim',
						captionOverride: '',
						markThemeOverride: null,
					})
				} else {
					const loaded = await loadVideoFile(file)
					slides.value.push({
						id: nextId(),
						kind,
						fileName: file.name,
						objectUrl: loaded.objectUrl,
						image: null,
						width: loaded.width,
						height: loaded.height,
						duration: loaded.duration,
						// The shorter of the two predefined cuts, because it is the one a
						// trimmed export has to fit inside.
						clipMode: 'trim',
						captionOverride: '',
						markThemeOverride: null,
					})
				}
			} catch (caught: unknown) {
				problems.push(caught instanceof Error ? caught.message : `Could not read “${file.name}”.`)
			}
		}

		if (files.length > room) {
			problems.push(`Only ${room} more slide${room === 1 ? '' : 's'} would fit — ${MAX_SLIDES} is the maximum.`)
		}

		error.value = problems.join(' ')
		isLoading.value = false
	}

	const removeSlide = (index: number): void => {
		const slide = slides.value[index]
		if (!slide) return

		releaseSlide(slide)
		slides.value.splice(index, 1)
		activeIndex.value = Math.min(activeIndex.value, Math.max(slides.value.length - 1, 0))
	}

	const moveSlide = (index: number, delta: number): void => {
		const target = index + delta
		if (target < 0 || target >= slides.value.length) return

		const [moved] = slides.value.splice(index, 1)
		if (!moved) return
		slides.value.splice(target, 0, moved)

		// Keep the slide the user was working on selected as it moves.
		if (activeIndex.value === index) activeIndex.value = target
		else if (activeIndex.value === target) activeIndex.value = index
	}

	const selectSlide = (index: number): void => {
		if (index < 0 || index >= slides.value.length) return
		activeIndex.value = index
	}

	const setClipMode = (index: number, mode: ClipMode): void => {
		const slide = slides.value[index]
		if (!slide) return
		slide.clipMode = mode
	}

	const setCaptionOverride = (index: number, value: string): void => {
		const slide = slides.value[index]
		if (!slide) return
		slide.captionOverride = value
	}

	/** `null` clears the override so the slide follows the shared default again. */
	const setMarkThemeOverride = (index: number, theme: MarkTheme | null): void => {
		const slide = slides.value[index]
		if (!slide) return
		slide.markThemeOverride = theme
	}

	const reset = (): void => {
		for (const slide of slides.value) releaseSlide(slide)
		slides.value = []
		activeIndex.value = 0
		error.value = ''
	}

	onBeforeUnmount(reset)

	return {
		slides,
		activeIndex,
		activeSlide,
		isFull,
		isLoading,
		error,
		addFiles,
		removeSlide,
		moveSlide,
		selectSlide,
		setClipMode,
		setCaptionOverride,
		setMarkThemeOverride,
		reset,
	}
}
