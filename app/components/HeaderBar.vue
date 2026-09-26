<script setup lang="ts">
defineEmits<{ toggleShow: [] }>()
</script>

<template lang="pug">
div(class="container py-4")
	div(class="grid grid-cols-3 items-center")
		//- Drawer toggle — the section nav lives in Aside
		button(type="button" aria-label="Open menu" class="justify-self-start cursor-pointer text-white hover:text-brand-accent duration-300" @click="$emit('toggleShow')")
			svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="w-6 h-6")
				path(fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17h18M3 12h18M3 7h18")
		//- Wordmark
		NuxtLink(to="/" class="justify-self-center")
			h1(class="text-2xl tracking-tight font-black text-white cursor-pointer") grugbox
		//- Newsletter call to action
		NuxtLink(to="/#newsletter" class="justify-self-end bg-brand-accent text-white uppercase text-xs font-bold tracking-wider px-4 py-2 hover:bg-white hover:text-black duration-300") Subscribe
</template>
