<script setup lang="ts">
import { MARK_THEME_OPTIONS, markThemeLabel } from '~/utils/workspace/mark'
import type { MarkTheme } from '~/utils/workspace/mark'

const props = defineProps<{
	/** The shared default, named on the "follow the default" option. */
	defaultTheme: MarkTheme
}>()

/** `null` means this slide follows the shared default. */
const model = defineModel<MarkTheme | null>({ required: true })

const select = (value: MarkTheme | null): void => {
	model.value = value
}
</script>

<template lang="pug">
div(class="flex flex-col gap-2")
	span(class="text-[10px] font-bold uppercase tracking-wide text-zinc-500") Logo

	div(class="flex flex-wrap gap-1.5")
		button(
			type="button"
			:aria-pressed="model === null"
			class="border px-2 py-1 text-[10px] font-bold uppercase tracking-wide duration-200"
			:class="model === null ? 'border-white text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'"
			@click="select(null)"
		) Default ({{ markThemeLabel(props.defaultTheme) }})

		button(
			v-for="option in MARK_THEME_OPTIONS"
			:key="option.value"
			type="button"
			:aria-pressed="model === option.value"
			class="flex items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-wide duration-200"
			:class="model === option.value ? 'border-white text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'"
			@click="select(option.value)"
		)
			span(
				class="flex size-4 shrink-0 items-center justify-center"
				:class="option.value === 'white' ? 'bg-zinc-950' : 'bg-zinc-300'"
			)
				workspace-mark-swatch(:theme="option.value" class="size-3")
			span {{ option.label }}
</template>
