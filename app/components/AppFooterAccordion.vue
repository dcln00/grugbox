<script setup lang="ts">
import type { FooterSection } from '~/utils/nav'

defineProps<{
	sections: FooterSection[]
}>()

const openSections = ref<Record<string, boolean>>({})

const toggleSection = (title: string) => {
	openSections.value[title] = !openSections.value[title]
}

const isSectionOpen = (title: string) => {
	return !!openSections.value[title]
}
</script>

<template lang="pug">
div(class="flex flex-col border-t border-neutral-800")
	div(v-for="section in sections" :key="section.title" class="border-b last:border-0 border-neutral-800")
		button(
			type="button"
			@click="toggleSection(section.title)"
			:aria-expanded="isSectionOpen(section.title)"
			class="group flex w-full items-center justify-between py-3.5 text-left cursor-pointer"
		)
			h6(class="text-neutral-400 group-hover:text-white tracking-wide uppercase font-bold text-[11px] duration-200") {{ section.title }}
			svg-chevron-down(
				class="size-3.5 text-neutral-400 group-hover:text-white duration-200 transition-transform"
				:class="{ 'rotate-180': isSectionOpen(section.title) }"
			)
		div(
			class="grid transition-all duration-300 ease-in-out"
			:class="isSectionOpen(section.title) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
		)
			div(class="overflow-hidden")
				ul(class="flex flex-col gap-2.5 pb-4 pt-1")
					li(v-for="link in section.links" :key="link.name")
						NuxtLink(:to="link.href" :target="link.target" :external="link.external" class="text-xs uppercase tracking-wide duration-300 hover:underline") {{ link.name }}
</template>
