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
		div(class="grid grid-cols-4 gap-20")
			//- TRENDING
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-2 space-y-8")
				h6(class="uppercase text-sm tracking-tight font-bold") Trending
				article(v-for="(post, idx) in posts" :key="idx" class="group")
					div(v-if="post.tags?.includes('trending')")
						div(class="space-y-4")
							.photo(class="aspect-square bg-gray-200 overflow-hidden")
								NuxtLink(:to="post.path")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
							div(class="space-y-1")
								NuxtLink(:to="post.path")
									p(class="text-xl leading-snug group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
								NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
			//- LATEST
			div(class="bg-brand-green col-span-full lg:col-span-2 max-lg:order-1 space-y-8")
				h6(class="uppercase text-sm tracking-tight font-bold") The Latest
				//- FULL
				article.featured(v-for="(post, idx) in posts.slice(0, 1)" :key="idx")
					div(v-if="!post.tags?.includes('trending')")
						div(class="space-y-6 group tracking-tight")
							.photo(class="aspect-video bg-gray-200 overflow-hidden")
								NuxtLink(:to="post.path")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
							div(class="space-y-1")
								NuxtLink(:to="post.path")
									p(class="text-5xl leading-14 group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
								NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
				//- GRID
				div(class="grid grid-cols-2 gap-8")
					article(v-for="(post, idx) in posts.slice(1).filter(x => !x.tags?.includes('trending'))" :key="idx" class="col-span-1")
						div(class="space-y-4 group tracking-tight")
							.photo(class="aspect-video bg-gray-200 overflow-hidden")
								NuxtLink(:to="post.path")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
							div(class="space-y-1")
								NuxtLink(:to="post.path")
									p(class="text-xl leading-snug group-hover:text-brand-accent duration-300") {{ post.title }}
								NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
			//- PLAYLISTS
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-3 space-y-8")
				h6(class="uppercase text-sm tracking-tight font-bold") Playlists
				article(v-for="(playlist, idx) in 1" :key="idx" class="space-y-6 group cursor-pointer mb-12 last:mb-0")
					h2(class="text-6xl font-extralight") 0{{ playlist}}.
					p(class="text-xl leading-snug group-hover:text-brand-accent tracking-tight") Grugbox on Apple Music

section#newsletter(class="py-12 bg-black")
	.container
		div(class="flex flex-wrap items-center")
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 lg:ms-auto space-y-4")
					p(class="text-white uppercase text-sm") Subscribe to the
					h2(class="text-7xl font-black text-white mb-6 font-menu") GRUGBOX #[br] #[span(class="text-brand-accent") DIGEST]
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 space-y-6")
					p(class="text-white") The most important stories and least important memes, every Friday.
					button(class="bg-brand-accent w-1/2 p-4 text-white uppercase border border-white font-bold") subscribe
</template>