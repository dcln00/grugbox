<script setup lang="ts">
import { MARK_THEME_OPTIONS } from '~/utils/workspace/mark'
import type { MarkTheme } from '~/utils/workspace/mark'

/** The shared default. Individual slides can override it. */
const model = defineModel<MarkTheme>({ required: true })
</script>

<template lang="pug">
div(class="flex flex-col gap-2")
	span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Logo

	div(class="grid grid-cols-2 gap-2")
		button(
			v-for="option in MARK_THEME_OPTIONS"
			:key="option.value"
			type="button"
			:aria-pressed="model === option.value"
			class="flex items-center gap-3 border px-2 py-2 duration-200"
			:class="model === option.value ? 'border-white' : 'border-zinc-700 hover:border-zinc-500'"
			@click="model = option.value"
		)
			//- Each swatch sits on the kind of background its colourway is meant for.
			span(
				class="flex size-9 shrink-0 items-center justify-center"
				:class="option.value === 'white' ? 'bg-zinc-950' : 'bg-zinc-300'"
			)
				workspace-mark-swatch(:theme="option.value" class="size-5")
			span(class="text-[10px] font-bold uppercase tracking-wide text-zinc-300") {{ option.label }}

	p(class="text-[10px] leading-relaxed text-zinc-500")
		| Default for every slide. Override it per slide below.
</template>
