<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{ suggestions: string[] }>()

const emit = defineEmits<{
	(e: 'commit'): void
}>()

const LIST_ID = 'workspace-category-options'
const QUICK_PICKS = 6

const pick = (value: string): void => {
	model.value = value
	emit('commit')
}
</script>

<template lang="pug">
div(class="flex flex-col gap-3")
	label(class="flex flex-col gap-2")
		span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Category
		input(
			v-model="model"
			type="text"
			:list="LIST_ID"
			maxlength="24"
			placeholder="MUSIC"
			autocomplete="off"
			class="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm uppercase tracking-wide outline-none duration-200 focus:border-white placeholder:text-zinc-600 placeholder:normal-case"
			@change="emit('commit')"
		)

	datalist(:id="LIST_ID")
		option(v-for="item in suggestions" :key="item" :value="item")

	div(class="flex flex-wrap gap-1.5")
		button(
			v-for="item in suggestions.slice(0, QUICK_PICKS)"
			:key="item"
			type="button"
			class="border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400 duration-200 hover:border-white hover:text-white"
			@click="pick(item)"
		) {{ item }}
</template>
