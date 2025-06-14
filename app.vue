<script setup lang="ts">
const { x, y } = useWindowScroll()

useHead({
	title: 'Grugbox',
})

useSeoMeta({
	title: 'Grugbox',
	ogTitle: 'Grugbox',
	description: ``,
	ogDescription: ``,
	ogType: 'website',
	ogImage: '',
	ogUrl: '',
	twitterDescription: '',
}) 
</script>

<template lang="pug">
.body-outlet(class="flex flex-col min-h-screen")
	Transition(name="top")
		.top(v-if="y > 200" class="fixed bottom-6 right-6 z-10 aspect-square bg-black group duration-200 hover:bg-white hover:border size-10 flex items-center justify-center cursor-pointer" @click="() => y = 0")
			svgo-caret(class="text-white group-hover:text-black text-sm")
	app-header
	main(class="lg:grow")
		NuxtPage
	app-footer
</template>

<style>
.top-enter-active, .top-leave-active {
	transition: all 0.3s ease-in-out;
}

.top-enter-from, .top-leave-to {	
	opacity: 0;
}
</style>