<script setup lang="ts">
import { useWorkspaceStudio } from '~/composables/useWorkspaceStudio'
import { usePngExport } from '~/composables/usePngExport'
import { setExportMonitor, useVideoExport } from '~/composables/useVideoExport'
import type { WorkspaceSlide } from '~/composables/useSlideDeck'
import { effectiveClip } from '~/utils/workspace/clip'
import { downloadBlob, nextPaint } from '~/utils/workspace/download'
import { buildFileName } from '~/utils/workspace/format'
import { extensionForMime, isMp4 } from '~/utils/workspace/mime'
import type { ClipMode } from '~/utils/workspace/types'
import type { MarkTheme } from '~/utils/workspace/mark'

definePageMeta({ middleware: 'workspace-auth' })

useHead({ title: 'Workspace — Grugbox' })
useSeoMeta({ robots: 'noindex, nofollow' })

const studio = useWorkspaceStudio()
const { toBlob } = usePngExport()
const videoExport = useVideoExport()

/**
 * Template refs bind by setup-scope name, so `ref="canvasEl"` cannot reach a ref
 * that only exists as `studio.canvasEl` — it would silently stay null and the
 * canvas would never be painted. These aliases are the same ref objects the
 * composable holds, so binding them here is enough.
 */
const canvasEl = studio.canvasEl
const videoEl = studio.videoEl

const exporting = ref(false)
const exportError = ref('')
const monitorAudio = ref(false)
const progressLabel = ref('')

const activeSlide = studio.activeSlide
const activeIndex = studio.activeIndex
const slides = studio.slides

const isVideoSlide = computed(() => activeSlide.value?.kind === 'video')

/** Per-slide override, or '' meaning "use the shared caption". */
const overrideText = computed({
	get: () => activeSlide.value?.captionOverride ?? '',
	set: (value: string) => studio.setCaptionOverride(activeIndex.value, value),
})

const usesOverride = computed(() => !!activeSlide.value?.captionOverride.trim())

/** Per-slide mark colourway; null means this slide follows the shared default. */
const markOverride = computed<MarkTheme | null>({
	get: () => activeSlide.value?.markThemeOverride ?? null,
	set: (value: MarkTheme | null) => studio.setMarkThemeOverride(activeIndex.value, value),
})

/** Per-slide: export the selected range, or the whole clip. */
const clipMode = computed<ClipMode>({
	get: () => activeSlide.value?.clipMode ?? 'trim',
	set: (value: ClipMode) => studio.setClipMode(activeIndex.value, value),
})

const captionFor = (slide: WorkspaceSlide): string =>
	slide.captionOverride.trim() || studio.caption.value

const enableOverride = (): void => {
	overrideText.value = activeSlide.value?.captionOverride.trim() || studio.caption.value
}

const clearOverride = (): void => {
	overrideText.value = ''
}

const extensionLabel = computed(() => {
	if (!isVideoSlide.value) return 'PNG'
	const format = videoExport.format.value
	if (!format) return 'video'
	return format.extension.toUpperCase()
})

/** Carousel export needs the next slide fully decoded before it can be captured. */
const settle = async (): Promise<void> => {
	await nextTick()

	const slide = activeSlide.value
	if (slide?.kind === 'video') {
		const video = studio.videoEl.value
		const deadline = Date.now() + 4000
		while (video && video.readyState < 2 && Date.now() < deadline) {
			await new Promise(resolve => setTimeout(resolve, 50))
		}
	}

	await nextPaint()
}

const exportSlide = async (slide: WorkspaceSlide, index: number): Promise<boolean> => {
	const canvas = studio.canvasEl.value
	if (!canvas) return false

	const total = slides.value.length

	if (slide.kind === 'image') {
		studio.draw()
		const blob = await toBlob(canvas)
		downloadBlob(blob, buildFileName(studio.category.value, captionFor(slide), index, total, 'png'))
		return true
	}

	const video = studio.videoEl.value
	if (!video) return false

	// Resolved from THIS slide rather than the current selection: a carousel
	// export walks the whole deck, and both "full video" and the format's clip
	// cap have to apply per slide.
	const clip = effectiveClip(slide, studio.format.value.maxClipSeconds)
	const blob = await videoExport.record(canvas, video, clip)

	if (!blob) {
		exportError.value = videoExport.status.value || 'The video export produced no file.'
		return false
	}

	const extension = extensionForMime(blob.type)
	downloadBlob(blob, buildFileName(studio.category.value, captionFor(slide), index, total, extension))
	return true
}

const exportCurrent = async (): Promise<void> => {
	const slide = activeSlide.value
	if (!slide || exporting.value) return

	exporting.value = true
	exportError.value = ''
	progressLabel.value = 'Preparing…'

	try {
		videoExport.refreshFormat()
		await exportSlide(slide, activeIndex.value)
	} catch (caught: unknown) {
		console.warn('[Workspace] export failed', caught)
		exportError.value = caught instanceof Error ? caught.message : 'Export failed.'
	} finally {
		exporting.value = false
		progressLabel.value = ''
	}
}

const exportAll = async (): Promise<void> => {
	if (exporting.value || slides.value.length === 0) return

	exporting.value = true
	exportError.value = ''

	try {
		for (let index = 0; index < slides.value.length; index += 1) {
			studio.selectSlide(index)
			await settle()

			const slide = slides.value[index]
			if (!slide) continue

			progressLabel.value = `Slide ${index + 1} of ${slides.value.length}…`
			const ok = await exportSlide(slide, index)
			if (!ok) break
		}
	} catch (caught: unknown) {
		console.warn('[Workspace] carousel export failed', caught)
		exportError.value = caught instanceof Error ? caught.message : 'Export failed.'
	} finally {
		exporting.value = false
		progressLabel.value = ''
	}
}

const logout = async (): Promise<void> => {
	await $fetch('/api/workspace/logout', { method: 'POST' })
	await navigateTo('/workspace/login')
}

watch(monitorAudio, value => setExportMonitor(value))
</script>

<template lang="pug">
div(class="min-h-screen bg-zinc-950 text-white lg:flex lg:h-screen lg:flex-col lg:overflow-hidden")
	header(class="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4")
		div(class="flex items-center gap-4")
			span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-500") Grugbox Workspace
		button(
			type="button"
			class="text-[10px] font-bold uppercase tracking-wide text-zinc-500 duration-200 hover:text-white"
			@click="logout"
		) Sign out

	div(class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-6")
		//- CANVAS
		//- On desktop the whole page is a fixed-height flex column, so this column is
		//- a definite-height flex child and the frame can fill whatever is actually
		//- left, rather than a guessed slice of the viewport. The aside scrolls on its
		//- own, so nothing moves the canvas.
		section(class="flex flex-col gap-4 lg:min-h-0")
			//- `w-auto` plus the aspect ratio derives width from height; `max-w-full`
			//- re-derives the height when width is the binding constraint (narrow
			//- phones), so the format's ratio holds either way. `object-contain` is
			//- the safety net for the one case where it does not — a very tall
			//- viewport, where the column width clamps first and the height does not
			//- follow. It letterboxes rather than stretching the preview; identical
			//- ratios make it a no-op everywhere else.
			div(class="relative flex min-h-0 justify-center overflow-hidden bg-black lg:flex-1")
				canvas(
					ref="canvasEl"
					:width="studio.format.value.width"
					:height="studio.format.value.height"
					class="block h-auto max-h-[calc(100vh-11rem)] w-auto max-w-full object-contain lg:max-h-full"
					:class="studio.format.value.previewAspectClass"
				)

				//- Covers the frame only while the active clip has no decoded frame to
				//- show. The canvas holds its last good frame meanwhile, so without this
				//- the preview is a black rectangle with the caption floating on it.
				div(
					v-if="studio.isPreparingFrame.value"
					class="absolute inset-0 flex items-center justify-center bg-zinc-900"
				)
					span(class="animate-pulse text-[10px] font-bold uppercase tracking-wide text-zinc-400") Loading video…

			//- Off-screen playback source. Kept rendered rather than display:none so
			//- the decoder keeps producing frames for the canvas.
			video(
				ref="videoEl"
				playsinline
				muted
				preload="auto"
				aria-hidden="true"
				class="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
				@timeupdate="studio.onTimeUpdate"
			)

			p(v-if="studio.fontFailed.value" class="text-[10px] leading-relaxed text-amber-300")
				| Google Sans did not load, so text metrics fall back to a system font. Reload if the layout looks off.

			p(v-if="studio.captionInfo.value.truncated" class="text-[10px] leading-relaxed text-amber-300")
				| This caption is too long even at the smallest size — some lines were dropped. Shorten it or split it across slides.

			p(
				v-else-if="studio.captionInfo.value.atMinimumFont"
				class="text-[10px] leading-relaxed text-amber-300"
			)
				| Long caption — the text is at its smallest size ({{ studio.captionInfo.value.lines }} lines).

		//- CONTROLS
		aside(class="flex flex-col gap-8 lg:min-h-0 lg:overflow-y-auto")
			//- Disabled mid-export, since resizing the canvas would wreck a recording
			//- that is already sampling it through captureStream, and while files are
			//- still decoding, so the format cannot change under a half-attached deck.
			workspace-format-picker(
				v-model="studio.formatId.value"
				:blocked="studio.blockedFormats.value"
				:disabled="exporting || studio.isLoading.value"
			)

			workspace-mark-picker(v-model="studio.defaultMarkTheme.value")

			workspace-category-field(
				v-model="studio.category.value"
				:suggestions="studio.suggestions.value"
				@commit="studio.commitCategory"
			)

			div(class="flex flex-col gap-2")
				label(class="flex flex-col gap-2")
					span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Caption
					textarea(
						v-model="studio.caption.value"
						rows="4"
						placeholder="Jude Dontoh’s Vocals Are Featured On Kanye West & Lauryn Hill’s Record “I CAN’T WAIT”"
						class="w-full resize-y bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm leading-relaxed outline-none duration-200 focus:border-white placeholder:text-zinc-600"
					)
				p(class="text-[10px] leading-relaxed text-zinc-500")
					| Line breaks are kept. The text shrinks to fit.

			workspace-slide-list(
				:slides="studio.slides.value"
				:active-index="studio.activeIndex.value"
				:is-full="studio.isFull.value"
				:format="studio.format.value"
				@select="studio.selectSlide"
				@remove="studio.removeSlide"
				@move="studio.moveSlide"
				@add="studio.addFiles"
			)

			p(v-if="studio.error.value" class="text-xs leading-relaxed text-red-400") {{ studio.error.value }}

			//- PER-SLIDE OVERRIDES (caption and logo colourway)
			div(v-if="activeSlide" class="flex flex-col gap-3 border-t border-zinc-800 pt-6")
				div(class="flex items-center justify-between gap-3")
					span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") This slide
					button(
						v-if="!usesOverride"
						type="button"
						class="text-[10px] font-bold uppercase tracking-wide text-zinc-500 duration-200 hover:text-white"
						@click="enableOverride"
					) Custom caption
					button(
						v-else
						type="button"
						class="text-[10px] font-bold uppercase tracking-wide text-zinc-500 duration-200 hover:text-white"
						@click="clearOverride"
					) Use shared
				textarea(
					v-if="usesOverride"
					v-model="overrideText"
					rows="3"
					class="w-full resize-y bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm leading-relaxed outline-none duration-200 focus:border-white"
				)

				workspace-slide-mark-picker(
					v-model="markOverride"
					:default-theme="studio.defaultMarkTheme.value"
				)

			//- CLIP LENGTH
			workspace-clip-length(
				v-if="isVideoSlide && activeSlide"
				v-model:mode="clipMode"
				:duration="activeSlide.duration"
				:format="studio.format.value"
			)

			//- EXPORT
			div(class="flex flex-col gap-4 border-t border-zinc-800 pt-6")
				div(class="flex items-baseline justify-between gap-3")
					span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Export
					span(class="text-[10px] uppercase tracking-wide text-zinc-500") {{ extensionLabel }}

				p(v-if="isVideoSlide" class="text-[10px] leading-relaxed text-zinc-500")
					| Video exports in real time. Keep this tab in the foreground or frames will stall.

				label(class="flex items-center gap-2 text-[10px] uppercase tracking-wide text-zinc-500")
					input(v-model="monitorAudio" type="checkbox" class="accent-white")
					span Play audio while previewing

				div(class="flex flex-col gap-2")
					button(
						type="button"
						:disabled="!activeSlide || exporting"
						class="bg-white py-3 text-[11px] font-bold uppercase tracking-wide text-black duration-200 hover:bg-zinc-200 disabled:opacity-40"
						@click="exportCurrent"
					)
						| {{ exporting ? (progressLabel || 'Working…') : `Download ${extensionLabel}` }}

					button(
						type="button"
						:disabled="slides.length < 2 || exporting"
						class="border border-zinc-700 py-3 text-[11px] font-bold uppercase tracking-wide text-zinc-200 duration-200 hover:border-white hover:text-white disabled:opacity-40"
						@click="exportAll"
					) Download all {{ slides.length }} slides

				div(v-if="videoExport.isRecording.value" class="flex flex-col gap-2")
					div(class="h-1 w-full bg-zinc-800")
						div(class="h-full bg-white duration-100" :style="{ width: `${Math.round(videoExport.progress.value * 100)}%` }")
					span(class="text-[10px] uppercase tracking-wide text-zinc-400")
						| Recording {{ Math.round(videoExport.progress.value * 100) }}%

				p(v-if="videoExport.status.value" class="text-[10px] leading-relaxed text-amber-300") {{ videoExport.status.value }}
				p(v-if="exportError" class="text-xs leading-relaxed text-red-400") {{ exportError }}

				p(
					v-if="isVideoSlide && videoExport.format.value && !isMp4(videoExport.format.value.mimeType)"
					class="text-[10px] leading-relaxed text-amber-300"
				)
					| This browser cannot record MP4, so the file will be WebM. Instagram accepts WebM unreliably — use Chrome or Safari for an MP4.

				p(class="text-[10px] leading-relaxed text-zinc-600")
					| Attachments live in this tab only. Refreshing loses them.
</template>
