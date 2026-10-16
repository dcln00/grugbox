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
	// Last-resort image, for any page that sets no image of its own.
	ogImage: OG_FALLBACK_IMAGE,
	ogSiteName: 'Grugbox | Music, Culture, Lifestyle + More.',
	ogUrl: 'https://grugbox.world',
	// Every og:image is normalised to 1200x630 by resolveOgImage, so the large
	// card is correct here; this was 'summary', which cropped them.
	twitterCard: 'summary_large_image',
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
	//- nuxt-skew-protection ships SkewNotification headless — it renders only a
	//- ClientOnly around this slot, so the prompt itself lives here.
	skew-notification(v-if="!isWorkspaceRoute" v-slot="{ isOpen, reload, dismiss }")
		Transition(name="skew")
			div(v-if="isOpen" class="skew fixed bottom-6 left-6 z-20 flex flex-wrap items-center gap-x-4 gap-y-3 bg-black text-white px-5 py-4 max-w-[calc(100vw-3rem)]")
				p(class="text-xs tracking-wide") A newer version of Grugbox is available.
				div(class="flex items-center gap-3")
					button(type="button" class="text-[11px] uppercase tracking-widest font-medium bg-white text-black px-3 py-1.5 cursor-pointer" @click="reload") Refresh
					button(type="button" class="text-[11px] uppercase tracking-widest text-neutral-400 hover:text-white cursor-pointer" @click="dismiss") Dismiss
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

.skew-enter-active, .skew-leave-active {
	transition: all 0.3s ease-in-out;
}

.skew-enter-from, .skew-leave-to {
	opacity: 0;
	transform: translateY(0.5rem);
}
</style>