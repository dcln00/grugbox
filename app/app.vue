<script setup lang="ts">
const { x, y } = useWindowScroll()

const route = useRoute()
// The team-only workspace tool renders its own chrome; the marketing header,
// drawer and footer would only be in the way.
const isWorkspaceRoute = computed(() => route.path.startsWith('/workspace'))

useHead({
	title: 'Grugbox | Music, Culture, Lifestyle + More.',
	htmlAttrs: {
    lang: 'en'
  },
	link: [
		{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
	],
})

useSeoMeta({
	title: 'Grugbox | Music, Culture, Lifestyle + More.',
	ogTitle: 'Grugbox | Music, Culture, Lifestyle + More.',
	description: `Creative hub of music, culture, lifestyle + more. @grugbox.wrld`,
	ogDescription: `Creative hub of music, culture, lifestyle + more. @grugbox.wrld`,
	ogType: 'website',
	ogImage: OG_FALLBACK_IMAGE,
	ogSiteName: 'Grugbox | Music, Culture, Lifestyle + More.',
	ogUrl: 'https://grugbox.world',
	twitterCard: 'summary',
	twitterTitle: 'Grugbox | Music, Culture, Lifestyle + More.',
	twitterImage: OG_FALLBACK_IMAGE,
	twitterDescription: 'Creative hub of music, culture, lifestyle + more. @grugbox.wrld',
})
</script>

<template lang="pug">
div(class="body-outlet flex flex-col min-h-screen")
	subscription-modal(v-if="!isWorkspaceRoute")
	Transition(name="top")
		div(v-if="!isWorkspaceRoute && y > 200" class="top fixed bottom-6 right-6 z-10 aspect-square bg-black group duration-200 size-10 flex items-center justify-center cursor-pointer" @click="() => y = 0")
			svg-arrow-up(class="w-3.5 h-3.5 text-white")
	app-header(v-if="!isWorkspaceRoute")
	app-drawer(v-if="!isWorkspaceRoute")
	main(class="lg:grow")
		NuxtPage
	app-footer(v-if="!isWorkspaceRoute")
</template>

<style>
.top-enter-active, .top-leave-active {
	transition: all 0.3s ease-in-out;
}

.top-enter-from, .top-leave-to {	
	opacity: 0;
}
</style>