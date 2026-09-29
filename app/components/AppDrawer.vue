<script setup lang="ts">
const route = useRoute()
const isMenuOpen = useState<boolean>('isMenuOpen', () => false)
const isDynamicHeaderHidden = useState<boolean>('isDynamicHeaderHidden', () => false)

// Main navigation links
const primaryLinks = [
	{ href: '/articles', name: 'Articles' },
	{ href: '/reviews', name: 'Reviews' },
	{ href: '/interviews', name: 'Interviews' },
	{ href: '/playlists', name: 'Playlists' },
]

// Subsection links
const secondaryLinks = [
	{ href: '/newsletter', name: 'Newsletter' },
	{ href: '/contact', name: 'Contact' },
]

// Query trending articles
const { data: allArticles } = await useAsyncData('drawer-trending-articles', () => {
	return queryCollection('articles')
		.select('title', 'path', 'image', 'date', 'category', 'tags')
		.order('date', 'DESC')
		.all()
})

const trendingPosts = computed(() => {
	return allArticles.value?.filter(item => item.tags?.includes('trending')).slice(0, 3) ?? []
})

function closeMenu() {
	isMenuOpen.value = false
	// Allow drawer slide-out animation to complete before re-enabling dynamic header
	setTimeout(() => {
		isDynamicHeaderHidden.value = false
	}, 350)
}

// Lock scroll when menu is active
if (import.meta.client) {
	watch(isMenuOpen, (open) => {
		if (open) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
	})

	// Close menu on Escape key press
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && isMenuOpen.value) {
			closeMenu()
		}
	}

	window.addEventListener('keydown', handleKeyDown)

	onBeforeUnmount(() => {
		document.body.style.overflow = ''
		window.removeEventListener('keydown', handleKeyDown)
	})
}

// Close menu when route changes
watch(() => route.fullPath, () => {
	closeMenu()
})
</script>

<template lang="pug">
Teleport(to="body")
	div
		//- Backdrop overlay
		Transition(name="fade")
			div(
				v-if="isMenuOpen"
				class="fixed inset-0 bg-black/60 z-50 cursor-pointer"
				@click="closeMenu"
				aria-hidden="true"
			)

		//- Sliding Drawer Panel
		Transition(name="slide-left")
			aside(
				v-if="isMenuOpen"
				role="dialog"
				aria-modal="true"
				aria-label="Navigation Menu"
				class="fixed inset-y-0 left-0 w-full max-w-sm sm:max-w-sm bg-white z-50 shadow-2xl flex flex-col overflow-y-auto p-8 sm:p-8"
			)
				//- Top Header Row: Logo & Close Button
				div(class="flex items-center justify-between pb-6")
					NuxtLink(to="/" @click="closeMenu" aria-label="Grugbox Home" class="w-fit")
						svg-logo(class="h-6 w-auto text-black" aria-hidden="true")
					button(
						type="button"
						aria-label="Close menu"
						@click="closeMenu"
						class="size-9 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 duration-200 cursor-pointer"
					)
						svg-close(class="size-5")

				//- Section 1: Main Navigation Links
				nav(aria-label="Main Navigation" class="flex flex-col py-2")
					NuxtLink(
						v-for="item in primaryLinks"
						:key="item.href"
						:to="item.href"
						@click="closeMenu"
						class="py-2 text-[11px] font-medium uppercase tracking-widest text-zinc-900 hover:text-brand-accent duration-200 flex items-center justify-between group"
					)
						span {{ item.name }}
						svg-chevron-right(class="size-3 text-zinc-400 group-hover:text-black duration-200")

				div(class="h-px w-full bg-zinc-200/80 my-4")

				//- Section 2: Subsection Links (Newsletter, Contact, About)
				nav(aria-label="Secondary Navigation" class="flex flex-col py-1")
					NuxtLink(
						v-for="sub in secondaryLinks"
						:key="sub.name"
						:to="sub.href"
						@click="closeMenu"
						class="py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500 hover:text-black duration-200"
					) {{ sub.name }}

				div(class="h-px w-full bg-zinc-200/80 my-4")

				//- Section 3: Trending Posts
				div(class="flex flex-col gap-5 pt-2" v-if="trendingPosts.length")
					h3(class="text-[11px] font-bold uppercase tracking-widest text-zinc-900 text-center") Trending Posts
					div(class="flex flex-col gap-4")
						NuxtLink(
							v-for="post in trendingPosts"
							:key="post.path"
							:to="post.path"
							@click="closeMenu"
							class="group flex gap-4 items-center"
						)
							div(class="size-20 shrink-0 bg-zinc-100 overflow-hidden")
								NuxtImg(:src="post.image" alt="" class="w-full h-full object-cover object-center select-none pointer-events-none")
							div(class="flex flex-col gap-2 min-w-0")
								h4(class="text-xs leading-snug tracking-tight text-zinc-900 group-hover:text-brand-accent duration-200 line-clamp-2") {{ post.title }}
								NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase text-zinc-400")
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
	transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
	transform: translateX(-100%);
}
</style>
