<script setup lang="ts">
const { x, y } = useWindowScroll()

useHead({
	title: 'Grugbox | Music, Culture, Lifestyle + More.',
	htmlAttrs: {
    lang: 'en'
  },
})

useSeoMeta({
	title: 'Grugbox | Music, Culture, Lifestyle + More.',
	ogTitle: 'Grugbox | Music, Culture, Lifestyle + More.',
	description: `Creative hub of music, culture, lifestyle + more. @grugbox.wrld`,
	ogDescription: `Creative hub of music, culture, lifestyle + more. @grugbox.wrld`,
	ogType: 'website',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1791564146/Grugbox/grugbox-og.jpg',
	ogSiteName: 'Grugbox | Music, Culture, Lifestyle + More.',
	ogUrl: 'https://grugbox.world',
	twitterCard: 'summary',
	twitterTitle: 'Grugbox | Music, Culture, Lifestyle + More.',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1791564146/Grugbox/grugbox-og.jpg',
	twitterDescription: 'Creative hub of music, culture, lifestyle + more. @grugbox.wrld',
})
</script>

<template lang="pug">
div(class="body-outlet flex flex-col min-h-screen")
	subscription-modal
	Transition(name="top")
		div(v-if="y > 200" class="top fixed bottom-6 right-6 z-10 aspect-square bg-black group duration-200 size-10 flex items-center justify-center cursor-pointer" @click="() => y = 0")
			svg-arrow-up(class="w-3.5 h-3.5 text-white")
	app-header
	app-drawer
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