<script setup lang="ts">
useHead({
	title: 'Playlists - Grugbox',
})

useSeoMeta({
	description: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	ogDescription: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	twitterDescription: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})

const { data: playlists } = await useAsyncData('playlists', () => {
  return queryCollection('playlists')
	.select('title', 'path', 'image', 'date')
	.order('date', 'DESC')
	.all()
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	div(class="container")
		div(class="flex flex-col gap-8")
			h1(class="text-4xl lg:text-7xl tracking-tight") Playlists
			hr(class="border-zinc-200")
			p(class="text-zinc-600 lg:w-1/2") Curated collections of the best sounds from Ghana and beyond. Discover new music and revisit timeless classics.

section#playlists(class="py-12 lg:py-20")
	div(class="container")
		div(v-if="playlists?.length" class="flex flex-col gap-16")
			//- Featured Playlist
			article(v-if="playlists[0]" class="group")
				div(class="grid lg:grid-cols-2 gap-8")
					div(class="photo aspect-square lg:aspect-video bg-gray-200 overflow-hidden")
						NuxtLink(:to="playlists[0].path")
							NuxtImg(:src="playlists[0].image" alt="playlist cover" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
					div(class="flex flex-col justify-center gap-4")
						NuxtLink(:to="playlists[0].path")
							h2(class="text-3xl lg:text-5xl group-hover:text-brand-accent tracking-tight duration-300") {{ playlists[0].title }}
						NuxtTime(:datetime="playlists[0].date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")

			//- Playlist Grid
			div(class="grid grid-cols-2 lg:grid-cols-4 gap-8")
				article(v-for="(playlist, idx) in playlists.slice(1)" :key="idx" class="group")
					div(class="flex flex-col gap-4")
						div(class="photo aspect-square bg-gray-200 overflow-hidden")
							NuxtLink(:to="playlist.path")
								NuxtImg(:src="playlist.image" alt="playlist cover" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
						div(class="flex flex-col gap-2")
							NuxtLink(:to="playlist.path")
								p(class="text-xl group-hover:text-brand-accent tracking-tight duration-300") {{ playlist.title }}
							NuxtTime(:datetime="playlist.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")

		//- Empty State
		div(v-else class="text-center py-20")
			p(class="text-zinc-500 text-lg") No playlists yet. Check back soon!
</template>

