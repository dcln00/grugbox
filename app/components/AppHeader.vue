<script setup lang="ts">
const route = useRoute()
const { y } = useWindowScroll()
const isNotScrolled = computed(() => y.value < 200)

const isArticleSlug = computed(() => {
  return Boolean(
    route.params.slug &&
    (route.path.startsWith('/articles/') ||
     route.path.startsWith('/reviews/') ||
     route.path.startsWith('/interviews/') ||
     route.path.startsWith('/playlists/'))
  )
})

const currentArticleTitle = useState<string | null>('currentArticleTitle', () => null)

const fallbackSlugTitle = computed(() => {
  const slug = route.params.slug as string
  if (!slug) return ''
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const articleTitle = computed(() => currentArticleTitle.value || fallbackSlugTitle.value)

const isMenuOpen = useState<boolean>('isMenuOpen', () => false)
const isDynamicHeaderHidden = useState<boolean>('isDynamicHeaderHidden', () => false)

function openMenu() {
	if (!isNotScrolled.value) {
		// Dynamic header is active: slide it up to hide it, then open drawer
		isDynamicHeaderHidden.value = true
		setTimeout(() => {
			isMenuOpen.value = true
		}, 250)
	} else {
		isMenuOpen.value = true
	}
}
</script>

<template lang="pug">
div
	header(class="bg-zinc-900")
		div(class="container py-6")
			div(class="grid grid-cols-3 items-center")
				//- First column: Hamburger icon
				div(class="justify-self-start flex items-center")
					button(type="button" aria-label="Open menu" class="text-white hover:text-neutral-300 duration-200 cursor-pointer p-1 -ml-1" @click="openMenu")
						svg-hamburger(class="size-5")
				//- Wordmark
				NuxtLink(to="/" class="justify-self-center")
					h1(class="cursor-pointer")
						span(class="sr-only") Grugbox
						svg-logo(class="h-7 w-auto text-white" aria-hidden="true")
				//- Newsletter call to action
				NuxtLink(to="/newsletter" class="justify-self-end hidden md:inline-block bg-red-800 text-neutral-200 uppercase text-[11px] font-bold tracking-wider px-6 py-1 hover:bg-white hover:text-black duration-300") Subscribe
		nav(aria-label="Sections" class="hidden md:flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:gap-x-10 py-4 border-t-[0.5px] border-neutral-500")
			NuxtLink(v-for="item in NAV_LINKS" :key="item.href" :to="item.href" class="text-[11px] font-bold uppercase tracking-widest text-neutral-300 duration-300 hover:text-white") {{ item.name }}

	Transition(name="nav")
		header(v-if="!isNotScrolled && !isDynamicHeaderHidden" class="fixed top-0 w-full bg-zinc-900 z-40")
			div(class="container py-4")
				div(class="grid grid-cols-3 items-center")
					//- First grid column: Hamburger icon
					div(class="justify-self-start flex items-center")
						button(type="button" aria-label="Open menu" class="text-white hover:text-neutral-300 duration-200 cursor-pointer p-1 -ml-1" @click="openMenu")
							svg-hamburger(class="size-5")
					//- Center grid column: Wordmark OR Article Title if on article slug
					div(class="justify-self-center max-w-xs md:max-w-md lg:max-w-xl text-center")
						h1(v-if="isArticleSlug && articleTitle" class="text-xs md:text-sm tracking-tight text-white line-clamp-1 cursor-pointer" @click="() => y = 0") {{ articleTitle }}
						NuxtLink(v-else to="/")
							h1(class="cursor-pointer")
								span(class="sr-only") Grugbox
								svg-logo(class="h-7 w-auto text-white" aria-hidden="true")
					//- Third grid column: Newsletter call to action
					NuxtLink(to="/newsletter" class="justify-self-end hidden md:inline-block bg-red-800 text-neutral-200 uppercase text-[11px] font-bold tracking-wider px-6 py-1 hover:bg-white hover:text-black duration-300") Subscribe
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
