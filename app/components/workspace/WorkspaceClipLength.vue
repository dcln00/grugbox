<script setup lang="ts">
import { TRIMMED_CLIP_SECONDS } from '~/utils/workspace/constants'
import { effectiveClip } from '~/utils/workspace/clip'
import { formatDuration } from '~/utils/workspace/format'
import type { CanvasFormat } from '~/utils/workspace/canvasFormat'
import type { ClipMode } from '~/utils/workspace/types'

const props = defineProps<{
	/** Full source length in seconds. */
	duration: number
	/** The active canvas — supplies the platform cap and its wording. */
	format: CanvasFormat
}>()

/** The predefined trimmed cut, or the whole clip. Both start at the beginning. */
const mode = defineModel<ClipMode>('mode', { required: true })

/** The range that will actually be recorded — the same rule the exporter uses. */
const clip = computed(() =>
	effectiveClip({ duration: props.duration, clipMode: mode.value }, props.format.maxClipSeconds),
)

const isFull = computed(() => mode.value === 'full')
const clipLength = computed(() => Math.max(clip.value.end - clip.value.start, 0))
const hitsCap = computed(() => props.duration > props.format.maxClipSeconds)

/** Worth saying out loud, since the two buttons then produce identical files. */
const trimmedIsWholeClip = computed(
	() => props.duration > 0 && props.duration <= TRIMMED_CLIP_SECONDS,
)
</script>

<template lang="pug">
div(class="flex flex-col gap-3")
	div(class="flex items-baseline justify-between gap-3")
		span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Length
		span(class="text-[11px] tabular-nums text-zinc-400") {{ formatDuration(clipLength) }}

	div(class="flex flex-wrap gap-1.5")
		button(
			type="button"
			:aria-pressed="!isFull"
			class="border px-2 py-1 text-[10px] font-bold uppercase tracking-wide duration-200"
			:class="!isFull ? 'border-white text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'"
			@click="mode = 'trim'"
		) Trimmed
		button(
			type="button"
			:aria-pressed="isFull"
			class="border px-2 py-1 text-[10px] font-bold uppercase tracking-wide duration-200"
			:class="isFull ? 'border-white text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'"
			@click="mode = 'full'"
		) Full video

	p(v-if="isFull && hitsCap" class="text-[10px] leading-relaxed text-amber-300")
		| {{ format.clipHint }} This clip is {{ formatDuration(duration) }}, so the export will be {{ formatDuration(clipLength) }}.

	p(v-else-if="isFull" class="text-[10px] leading-relaxed text-zinc-500")
		| The whole clip — {{ formatDuration(duration) }}.

	p(v-else class="text-[10px] leading-relaxed text-zinc-500")
		| The opening {{ TRIMMED_CLIP_SECONDS }} seconds.
		span(v-if="trimmedIsWholeClip")  This clip is shorter than that, so both options give the same file.

	p(class="text-[10px] leading-relaxed text-zinc-500")
		| Recording happens in real time — a {{ formatDuration(clipLength) }} clip takes about that long. Keep this tab in the foreground.
</template>
