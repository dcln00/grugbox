<script setup lang="ts">
import { MAX_CLIP_SECONDS } from '~/utils/workspace/constants'
import { formatDuration } from '~/utils/workspace/format'
import type { TrimRange } from '~/utils/workspace/types'

const props = defineProps<{
	/** Full source length in seconds. */
	duration: number
	trim: TrimRange
}>()

const emit = defineEmits<{
	(e: 'update', trim: TrimRange): void
}>()

const STEP_SECONDS = 0.1
const MIN_SEGMENT_SECONDS = 0.5

/** The furthest the out-point may go: the source length, or the 60s platform cap. */
const maxEnd = computed(() => Math.min(props.duration, MAX_CLIP_SECONDS))
const clipLength = computed(() => Math.max(props.trim.end - props.trim.start, 0))
const hitsCap = computed(() => props.duration > MAX_CLIP_SECONDS)

const setStart = (value: number): void => {
	const start = Math.min(Math.max(value, 0), Math.max(props.trim.end - MIN_SEGMENT_SECONDS, 0))
	// Pulling the in-point back can push the segment past the cap; drag the
	// out-point along rather than silently exceeding it.
	const end = Math.min(props.trim.end, start + MAX_CLIP_SECONDS, Math.max(maxEnd.value, start + MIN_SEGMENT_SECONDS))

	emit('update', { start, end })
}

const setEnd = (value: number): void => {
	const end = Math.min(
		Math.max(value, props.trim.start + MIN_SEGMENT_SECONDS),
		Math.min(maxEnd.value, props.trim.start + MAX_CLIP_SECONDS),
	)

	emit('update', { start: props.trim.start, end })
}

/**
 * Vue compiles template expressions as plain JS, NOT TypeScript — an `as` cast
 * inline in the template is a syntax error that takes the whole page down. The
 * narrowing lives here instead.
 */
const onStartInput = (event: Event): void => {
	const target = event.target as HTMLInputElement
	setStart(Number(target.value))
}

const onEndInput = (event: Event): void => {
	const target = event.target as HTMLInputElement
	setEnd(Number(target.value))
}
</script>

<template lang="pug">
div(class="flex flex-col gap-3")
	div(class="flex items-baseline justify-between gap-3")
		span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Trim
		span(class="text-[11px] tabular-nums text-zinc-400")
			| {{ formatDuration(clipLength) }}
			span(class="text-zinc-600")  / {{ formatDuration(MAX_CLIP_SECONDS) }} max

	label(class="flex flex-col gap-1")
		span(class="text-[10px] uppercase tracking-wide text-zinc-500")
			| In — {{ formatDuration(trim.start) }}
		input(
			type="range"
			:min="0"
			:max="maxEnd"
			:step="STEP_SECONDS"
			:value="trim.start"
			class="w-full accent-white"
			@input="onStartInput"
		)

	label(class="flex flex-col gap-1")
		span(class="text-[10px] uppercase tracking-wide text-zinc-500")
			| Out — {{ formatDuration(trim.end) }}
		input(
			type="range"
			:min="0"
			:max="maxEnd"
			:step="STEP_SECONDS"
			:value="trim.end"
			class="w-full accent-white"
			@input="onEndInput"
		)

	p(v-if="hitsCap" class="text-[10px] leading-relaxed text-zinc-500")
		| Source is {{ formatDuration(duration) }}; Instagram feed video caps at 60 seconds, so the selection cannot go longer.
	p(class="text-[10px] leading-relaxed text-zinc-500")
		| Recording happens in real time — a {{ formatDuration(clipLength) }} clip takes about that long. Keep this tab in the foreground.
</template>
