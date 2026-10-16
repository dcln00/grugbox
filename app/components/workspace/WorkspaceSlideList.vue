<script setup lang="ts">
import type { WorkspaceSlide } from '~/composables/useSlideDeck'
import { MAX_SLIDES } from '~/utils/workspace/constants'
import type { CanvasFormat } from '~/utils/workspace/canvasFormat'

defineProps<{
	slides: WorkspaceSlide[]
	activeIndex: number
	isFull: boolean
	/** The active canvas — decides what may be attached and what to say about it. */
	format: CanvasFormat
}>()

const emit = defineEmits<{
	(e: 'select', index: number): void
	(e: 'remove', index: number): void
	(e: 'move', index: number, delta: number): void
	(e: 'add', files: File[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const onFiles = (event: Event): void => {
	const input = event.target as HTMLInputElement
	const files = Array.from(input.files ?? [])
	if (files.length) emit('add', files)
	// Reset so re-picking the same file still fires a change event.
	input.value = ''
}

const openPicker = (): void => fileInput.value?.click()
</script>

<template lang="pug">
div(class="flex flex-col gap-3")
	div(class="flex items-center justify-between gap-3")
		span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400")
			| Slides
			span(v-if="slides.length" class="text-zinc-600")  {{ slides.length }}/{{ MAX_SLIDES }}
		button(
			type="button"
			:disabled="isFull"
			class="border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-300 duration-200 hover:border-white hover:text-white disabled:opacity-40"
			@click="openPicker"
		) Add media

	input(
		ref="fileInput"
		type="file"
		:accept="format.acceptAttribute"
		multiple
		class="hidden"
		@change="onFiles"
	)

	p(v-if="!slides.length" class="text-xs leading-relaxed text-zinc-500") {{ format.emptyDeckHint }}

	ul(class="flex flex-col gap-2")
		li(
			v-for="(slide, index) in slides"
			:key="slide.id"
			class="flex items-center gap-3 border p-2 duration-200"
			:class="index === activeIndex ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600'"
		)
			button(type="button" class="shrink-0 size-12 overflow-hidden bg-zinc-800" @click="emit('select', index)")
				img(v-if="slide.kind === 'image'" :src="slide.objectUrl" alt="" class="size-full object-cover")
				div(v-else class="flex size-full items-center justify-center text-[9px] font-bold uppercase tracking-wide text-zinc-400") Video

			div(class="flex min-w-0 flex-1 flex-col gap-0.5")
				button(type="button" class="truncate text-left text-xs text-zinc-200" @click="emit('select', index)") {{ slide.fileName }}
				span(class="text-[10px] uppercase tracking-wide text-zinc-500")
					| {{ slide.kind === 'image' ? 'PNG' : 'MP4' }}
					span(v-if="slide.clipMode === 'full'")  · full video
					span(v-if="slide.captionOverride.trim()")  · custom caption

			div(class="flex shrink-0 items-center gap-1")
				button(
					type="button"
					:disabled="index === 0"
					aria-label="Move up"
					class="px-1.5 py-1 text-xs text-zinc-400 duration-200 hover:text-white disabled:opacity-30"
					@click="emit('move', index, -1)"
				) ↑
				button(
					type="button"
					:disabled="index === slides.length - 1"
					aria-label="Move down"
					class="px-1.5 py-1 text-xs text-zinc-400 duration-200 hover:text-white disabled:opacity-30"
					@click="emit('move', index, 1)"
				) ↓
				button(
					type="button"
					aria-label="Remove"
					class="px-1.5 py-1 text-xs text-zinc-400 duration-200 hover:text-red-400"
					@click="emit('remove', index)"
				) ✕
</template>
