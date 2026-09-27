<script setup lang="ts">
const { y } = useWindowScroll()
const isNotScrolled = computed(() => y.value < 200)
</script>

<template lang="pug">
div
	header(class="bg-zinc-900")
		div(class="container py-6")
			div(class="grid grid-cols-3 items-center")
				//- Empty cell holds the first grid column so the wordmark stays centred
				div
				//- Wordmark
				NuxtLink(to="/" class="justify-self-center")
					h1(class="cursor-pointer")
						span(class="sr-only") Grugbox
						SvgLogo(class="h-7 w-auto text-white" aria-hidden="true")
				//- Newsletter call to action
				NuxtLink(to="/#newsletter" class="justify-self-end bg-red-800 text-neutral-200 uppercase text-[11px] font-bold tracking-wider px-6 py-1 hover:bg-white hover:text-black duration-300") Subscribe
		nav(aria-label="Sections" class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:gap-x-10 py-4 border-t-[0.5px] border-neutral-500")
			NuxtLink(v-for="item in NAV_LINKS" :key="item.href" :to="item.href" class="text-[11px] font-bold uppercase tracking-widest text-neutral-300 duration-300 hover:text-white") {{ item.name }}

	Transition(name="nav")
		header(v-if="!isNotScrolled" class="fixed top-0 w-full bg-zinc-900 z-10")
			div(class="container py-4")
				div(class="grid grid-cols-3 items-center")
					//- Empty cell holds the first grid column so the wordmark stays centred
					div
					//- Wordmark
					NuxtLink(to="/" class="justify-self-center")
						h1(class="cursor-pointer")
							span(class="sr-only") Grugbox
							SvgLogo(class="h-7 w-auto text-white" aria-hidden="true")
					//- Newsletter call to action
					NuxtLink(to="/#newsletter" class="justify-self-end bg-red-800 text-neutral-200 uppercase text-[11px] font-bold tracking-wider px-6 py-1 hover:bg-white hover:text-black duration-300") Subscribe
			//- nav(aria-label="Sections" class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:gap-x-10 py-4 border-t-[0.5px] border-neutral-500")
				NuxtLink(v-for="item in NAV_LINKS" :key="item.href" :to="item.href" class="text-[11px] font-bold uppercase tracking-widest text-neutral-300 duration-300 hover:text-white") {{ item.name }}
</template>

<style scoped>
.nav-enter-active, .nav-leave-active {
	transition: all 0.25s ease-in-out;
}

.nav-enter-from, .nav-leave-to {
	transform: translateY(-100%);
}
</style>
