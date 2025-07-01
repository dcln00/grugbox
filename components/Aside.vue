<script setup lang="ts">
defineProps({
	show: Boolean,
})

const nav = [
	{
		href: '/music',
		name: 'Music',
	},
	{
		href: '/interviews',
		name: 'Interviews',
	},
	{
		href: '/playlists',
		name: 'Playlists',
	},
	{
		href: '/merch',
		name: 'Merch',
	},
	{
		href: '/newsletter',
		name: 'Newsletter',
	},
]
</script>

<template lang="pug">
div
	Transition(name="overlay")
		.overlay(v-if="show" @click="$emit('toggleShow')" class="fixed top-0 left-0 z-10 w-full h-dvh bg-black/70")
	Transition(name="nav")
		nav(class="fixed top-0 right-0 z-50 bg-white w-2/3 lg:w-1/3 h-screen p-8" v-if="show")
			div(class="mb-16 flex flex-col h-full")
				.nav-header(class="flex items-center mb-12")
					svgo-close(class="text-black ms-auto cursor-pointer text-xl" @click="$emit('toggleShow')")
				ul(class="*:tracking-tight *:text-black *:capitalize space-y-4 block lg:hidden")
					li(v-for="(item, index) in nav" :key="index") #[NuxtLink(:to="item.href" activeClass='active-link' @click="$emit('toggleShow')") {{ item.name }}]
				div(class="mt-auto flex flex-col gap-4")
					h6 Find us
					.socials(class="flex items-center gap-8")
						NuxtLink(to="#")
							svgo-x(class="text-2xl text-zinc-400")
						NuxtLink(to="#")
							svgo-instagram(class="text-2xl text-zinc-400")
						NuxtLink(to="#")
							svgo-apple(class="text-2xl text-zinc-400")
						NuxtLink(to="#")
							svgo-spotify(class="text-2xl text-zinc-400")
</template>

<style scoped>
.nav-enter-active, .nav-leave-active {
	transition: all 0.3s ease-in-out;
}

.nav-enter-from, .nav-leave-to {
	transform: translateX(100%);
}


.overlay-enter-active,
.overlay-leave-active {
	transition: all .4s;
	  transition-timing-function: ease-in;
}

.overlay-leave-to, .overlay-enter-from {
	  opacity: 0;
}
</style>