<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
	error?: NuxtError
}>()

const is404 = computed(() => !props.error || props.error.statusCode === 404)
const statusCode = computed(() => props.error?.statusCode || 404)
const errorMessage = computed(() => {
	if (is404.value) return 'Sorry, there is nothing to see here.'
	return props.error?.statusMessage || 'An unexpected error occurred.'
})

useHead({
	title: computed(() => `Grugbox - ${is404.value ? 'Page Not Found' : 'Error'}`),
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template lang="pug">
div(class="body-outlet flex flex-col min-h-screen")
	app-header
	app-drawer
	main(class="flex-1 flex items-center justify-center py-16 lg:py-24")
		div(class="container")
			div(class="max-w-xl mx-auto flex flex-col items-center text-center gap-6")
				span(class="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-brand-accent") Error
				h1(class="text-6xl sm:text-8xl md:text-9xl font-medium tracking-tighter text-zinc-900 leading-none") {{ statusCode }}
				div(class="flex flex-col gap-2 max-w-md")
					h2(class="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 leading-snug") {{ is404 ? 'Page Not Found' : 'Something went wrong' }}
					p(class="text-base text-zinc-600 leading-relaxed")
						| {{ errorMessage }} But don't worry, you can find plenty of other stories, reviews, and features on our homepage.
				div(class="flex flex-wrap items-center justify-center gap-4 pt-2")
					button(
						type="button"
						@click="handleError"
						class="px-8 py-3.5 bg-black text-white hover:bg-brand-accent text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer"
					) Back to Homepage
	app-footer
</template>