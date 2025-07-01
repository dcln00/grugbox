<script setup lang="ts">
const { x, y } = useWindowScroll()
const isNotScrolled = computed(() => y.value < 200)

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
	header
		.container(class="py-4 lg:py-10 border-b")
			div(class="flex items-center")
				NuxtLink(to="/" class="me-auto")
					h1(class="text-2xl tracking-tight font-black cursor-pointer") grugbox
				nav(class="hidden lg:block")
					ul(class="flex gap-4 *:cursor-pointer")
						li(v-for="(link, idx) in nav" :key="idx" class="hover:text-brand-accent uppercase text-lg tracking-tight font-medium") #[NuxtLink(:to="link.href" activeClass='active-link') {{ link.name }}]
				.hamburger(class="ms-auto cursor-pointer hover:text-brand-accent" @click="$emit('toggleShow')")
					svgo-hamburger(class="text-2xl")
			//- h1(class="font-logo uppercase font-black tracking-tighter text-9xl text-center pt-8") grugbox

	Transition(name="nav")
		header(v-if="!isNotScrolled" class="fixed top-0 w-full bg-white z-10 border-b")
			.container(class="py-4 flex items-center")
				NuxtLink(to="/" class="me-auto")
					h1(class="text-2xl tracking-tight font-black cursor-pointer") grugbox
				nav(class="hidden lg:block")
					ul(class="flex gap-4 *:cursor-pointer")
						li(v-for="(link, idx) in nav" :key="idx" class="hover:text-brand-accent uppercase text-lg tracking-tight font-medium") #[NuxtLink(:to="link.href" activeClass='active-link') {{ link.name }}]
				.hamburger(class="ms-auto cursor-pointer hover:text-brand-accent" @click="$emit('toggleShow')")
					svgo-hamburger(class="text-2xl")
</template>

<style scoped>
.nav-enter-active, .nav-leave-active {
	transition: all 0.25s ease-in-out;
}

.nav-enter-from, .nav-leave-to {
	transform: translateY(-100%);
}
</style>