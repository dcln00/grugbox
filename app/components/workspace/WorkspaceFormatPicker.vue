<script setup lang="ts">
import { FORMAT_OPTIONS } from '~/utils/workspace/canvasFormat'
import type { FormatId } from '~/utils/workspace/canvasFormat'

const model = defineModel<FormatId>({ required: true })

const props = defineProps<{
	/** Reason each format is unavailable, keyed by id. An absent id is selectable. */
	blocked: Partial<Record<FormatId, string>>
	/** True while an export is running, when resizing the canvas would break it. */
	disabled: boolean
}>()

const reasonFor = (id: FormatId): string => props.blocked[id] ?? ''

/**
 * Named as visible copy rather than a `title` on the disabled button: browsers
 * do not reliably show a tooltip for a disabled control, and the team needs to
 * know what is in the way and what to do about it.
 */
const blockedReason = computed<string>(
	() => FORMAT_OPTIONS.map(option => props.blocked[option.id]).find(Boolean) ?? '',
)

const select = (id: FormatId): void => {
	if (reasonFor(id)) return
	model.value = id
}
</script>

<template lang="pug">
div(class="flex flex-col gap-2")
	span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Canvas

	div(class="grid grid-cols-2 gap-2")
		button(
			v-for="option in FORMAT_OPTIONS"
			:key="option.id"
			type="button"
			:aria-pressed="model === option.id"
			:disabled="disabled || !!blocked[option.id]"
			class="flex flex-col items-start gap-0.5 border px-2 py-2 text-left duration-200 disabled:opacity-40"
			:class="model === option.id ? 'border-white' : 'border-zinc-700 hover:border-zinc-500'"
			@click="select(option.id)"
		)
			span(class="text-[10px] font-bold uppercase tracking-wide text-zinc-300") {{ option.label }}
			span(class="text-[10px] tabular-nums text-zinc-500") {{ option.dimensionsLabel }}
			span(class="text-[10px] tabular-nums text-zinc-600") {{ option.aspectLabel }}

	p(v-if="blockedReason" class="text-[10px] leading-relaxed text-amber-300") {{ blockedReason }}

	p(v-else class="text-[10px] leading-relaxed text-zinc-500")
		| The canvas sets the export size. Both are 1080 wide; the Reel is taller.
</template>
