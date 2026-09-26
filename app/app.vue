<script setup lang="ts">
const { x, y } = useWindowScroll()

const show = ref(false)

const toggleShow = () => {
	show.value = !show.value
}

useHead({
	title: 'Grugbox',
	htmlAttrs: {
    lang: 'en'
  },
})

useSeoMeta({
	title: 'Grugbox',
	ogTitle: 'Grugbox',
	description: `Creative hub of music, culture, lifestyle + more. Read the latest Alte, Afrobeats, Amapiano and African music news and interviews. @grugbox.wrld`,
	ogDescription: `Creative hub of music, culture, lifestyle + more. Read the latest Alte, Afrobeats, Amapiano and African music news and interviews. @grugbox.wrld`,
	ogType: 'website',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	ogSiteName: 'Grugbox ®',
	ogUrl: 'https://grugbox.world',
	twitterCard: 'summary',
	twitterTitle: 'Grugbox',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterDescription: 'Creative hub of music, culture, lifestyle + more. Read the latest Alte, Afrobeats, Amapiano and African music news and interviews. @grugbox.wrld',
})
</script>

<template lang="pug">
div(class="body-outlet flex flex-col min-h-screen")
	Transition(name="top")
		div(v-if="y > 200" class="top fixed bottom-6 right-6 z-10 aspect-square bg-black group duration-200 hover:bg-white hover:border size-10 flex items-center justify-center cursor-pointer" @click="() => y = 0")
			svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" aria-hidden="true" class="w-3.5 h-3.5 text-white group-hover:text-black")
				path(fill="currentColor" d="M216.49 168.49a12 12 0 0 1-17 0L128 97l-71.51 71.49a12 12 0 0 1-17-17l80-80a12 12 0 0 1 17 0l80 80a12 12 0 0 1 0 17")
	app-header(@toggle-show="toggleShow")
	Aside(:show="show" @toggle-show="toggleShow")
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