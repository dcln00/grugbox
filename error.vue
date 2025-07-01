<script setup lang="ts">
import type { NuxtError } from '#app'

useHead({
	title: `Grugbox - Page Not Found`,
})

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>?

<template lang="pug">
.body-outlet(class="flex h-screen flex-col")
	app-header
	section#error(class="relative flex-1 flex items-center justify-center max-lg:container")
		div(class="text-center")
			h2(class="text-8xl pb-8 font-extrabold tracking-tighter") #[span(class="sr-only") Error] {{ error.statusCode }}
			p(class="text-xl lg:text-2xl") Sorry, there is nothing to see here.
			p(class="mt-4 mb-8") But dont worry, you can find plenty of other things on our homepage.
			button(rel="noopener noreferrer" class="mx-auto text-white bg-black p-6 cursor-pointer hover:bg-black/80" @click="handleError")
				p(class="text") Back to Homepage
</template>