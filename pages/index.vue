<script setup lang="ts">
const { data: posts, status, error } = await useAsyncData('posts', () => {
  return queryCollection('articles')
	.select('title', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})
</script>

<template lang="pug">
section(class="py-12")
	.container
		div(class="grid grid-cols-4 gap-12")
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-2")
				h6(class="uppercase text-sm tracking-tight pb-8 font-bold underline") Trending
				article(v-for="(post, idx) in posts" :key="idx" class="group")
					div(v-if="post.tags?.includes('trending')")
						NuxtLink(:to="post.path")
							div(class="space-y-4")
								.photo(class="aspect-square bg-gray-200 overflow-hidden")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
								p(class="text-xl leading-snug group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
			div(class="bg-brand-green col-span-full lg:col-span-2 max-lg:order-1")
				h6(class="uppercase text-sm tracking-tight pb-8 font-bold underline") The Latest
				article.featured(v-for="(post, idx) in posts" :key="idx")
					div(v-if="!post.tags?.includes('trending')")
						NuxtLink(:to="post.path")
							div(class="space-y-8 group")
								.photo(class="aspect-video bg-gray-200 overflow-hidden")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
								p(class="text-5xl leading-14 group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-3")
				h6(class="uppercase text-sm tracking-tight pb-8 font-bold underline") Playlists
				article(v-for="(playlist, idx) in 1" :key="idx" class="space-y-6 group cursor-pointer mb-12 last:mb-0")
					h2(class="text-6xl font-extralight") 0{{ playlist}}.
					p(class="text-xl leading-snug group-hover:text-brand-accent tracking-tight") Grugbox on Apple Music
</template>