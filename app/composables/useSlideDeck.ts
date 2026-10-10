import { MAX_CLIP_SECONDS, MAX_SLIDES } from '~/utils/workspace/constants'
import { kindForFile } from '~/utils/workspace/fileKind'
import { useMediaLoader } from '~/composables/useMediaLoader'
import type { MediaKind, TrimRange } from '~/utils/workspace/types'
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
	trim: TrimRange
	/** Empty means "use the shared caption". */
	captionOverride: string
	/** `null` means "use the shared mark colourway". */
	markThemeOverride: MarkTheme | null
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

	const addFiles = async (files: File[]): Promise<void> => {
		if (files.length === 0) return

		error.value = ''
		isLoading.value = true

		const room = MAX_SLIDES - slides.value.length
		if (room <= 0) {
			error.value = `A carousel holds at most ${MAX_SLIDES} slides. Remove one to add another.`
			isLoading.value = false
			return
		}

		for (const file of files.slice(0, room)) {
			const kind = kindForFile(file)

			if (!kind) {
				error.value = `“${file.name}” is not an image or a video.`
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
						trim: { start: 0, end: 0 },
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
						// Default to the opening of the clip, capped at the platform limit.
						trim: { start: 0, end: Math.min(loaded.duration, MAX_CLIP_SECONDS) },
						captionOverride: '',
						markThemeOverride: null,
					})
				}
			} catch (caught: unknown) {
				error.value = caught instanceof Error ? caught.message : `Could not read “${file.name}”.`
			}
		}

		if (files.length > room) {
			error.value = `Only ${room} more slide${room === 1 ? '' : 's'} would fit — ${MAX_SLIDES} is the maximum.`
		}

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

	const setTrim = (index: number, trim: TrimRange): void => {
		const slide = slides.value[index]
		if (!slide) return
		slide.trim = trim
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
		setTrim,
		setCaptionOverride,
		setMarkThemeOverride,
		reset,
	}
}
