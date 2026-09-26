<script setup lang="ts">
const route = useRoute()

const formatSlug = computed(() => {
	const slug = route.params.slug as string
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
})

const { data: playlist } = await useAsyncData(`playlist-${route.params.slug}`, () => {
	return queryCollection("playlists")
		.path(`/playlists/${route.params.slug}`)
		.first()
})

if (!playlist.value) {
	throw createError({ status: 404, statusText: "Playlist not found", fatal: true })
}

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

useSeoMeta({
	description: `Read the latest article on Grugbox about ${formatSlug.value}.`,
	ogDescription: `Read the latest article on Grugbox about ${formatSlug.value}.`,
	twitterDescription: `Read the latest article on Grugbox about ${formatSlug.value}.`,
	ogImage:
		playlist.value?.image ||
		"https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png",
	twitterImage:
		playlist.value?.image ||
		"https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png",
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	div(class="container lg:w-1/2")
		div(class="flex flex-col gap-8")
			div(class="photo w-full lg:aspect-video pointer-events-none")
				NuxtImg(:src="playlist.image" alt="featured image" class="w-full h-full object-cover object-center")
			div(class="title flex flex-col gap-4 lg:gap-6")
				h1(class="text-2xl lg:text-7xl tracking-tight") {{ playlist.title }}
				hr(class="border-zinc-200")
				div(class="author-date flex gap-4 *:tracking-tight")
					p Published #[NuxtTime(:datetime="playlist.date" month="long" day="numeric" year="numeric" relative)]

section#playlist(class="py-12 lg:py-12")
	div(class="container lg:w-1/2")
		div(class="flex flex-col gap-12")
			ContentRenderer(v-if="playlist" :value="playlist" class="prose max-w-none prose-a:no-underline prose-h2:pb-4 prose-h1:font-normal prose-h1:text-xl prose-p:text-zinc-600")
			div(class="tags flex items-center gap-4" v-if="playlist.tags?.length")
				p(class="text-xs uppercase") tags: 
				div(v-for="tag in playlist.tags" class="uppercase text-zinc-400 text-xs border px-4 py-2 hover:bg-black hover:text-white hover:border-0 duration-300") {{ tag }}
</template>
