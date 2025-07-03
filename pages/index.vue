<script setup lang="ts">
const { data: posts, status, error } = await useAsyncData('posts', () => {
  return queryCollection('articles')
	.select('title', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})

console.log(posts.value)
</script>

<template lang="pug">
section(class="py-12")
	.container
		div(class="grid grid-cols-4 gap-20")
			//- TRENDING
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-2 flex flex-col gap-8")
				h6 Trending
				article(v-for="(post, idx) in posts.filter(x => x.tags?.includes('trending'))" :key="idx" class="group")
					div(class="flex flex-col gap-4")
						.photo(class="aspect-video lg:aspect-square bg-gray-200 overflow-hidden")
							NuxtLink(:to="post.path")
								NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
						div(class="flex flex-col gap-2")
							NuxtLink(:to="post.path")
								p(class="text-xl group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
							NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
			//- LATEST
			div(class="bg-brand-green col-span-full lg:col-span-2 max-lg:order-1 flex flex-col gap-8")
				h6 The Latest
				//- FULL
				article.featured(v-for="(post, idx) in posts.filter(x => !x.tags?.includes('trending')).slice(0, 1)" :key="idx")
					//- div(v-if="!post.tags?.includes('trending')")
					div(class="flex flex-col gap-6 group tracking-tight")
						.photo(class="aspect-video bg-gray-200 overflow-hidden")
							NuxtLink(:to="post.path")
								NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
						div(class="flex flex-col gap-4")
							NuxtLink(:to="post.path")
								p(class="text-3xl lg:text-5xl group-hover:text-brand-accent tracking-tight duration-300") {{ post.title }}
							NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
				//- GRID
				div(class="grid grid-cols-2 gap-4 lg:gap-8")
					article(v-for="(post, idx) in posts.filter(x => !x.tags?.includes('trending')).slice(1)" :key="idx" class="col-span-1")
						div(class="flex flex-col gap-4 group tracking-tight")
							.photo(class="aspect-video bg-gray-200 overflow-hidden")
								NuxtLink(:to="post.path")
									NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
							div(class="flex flex-col gap-3")
								NuxtLink(:to="post.path")
									p(class="text-xl group-hover:text-brand-accent duration-300") {{ post.title }}
								NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
			//- PLAYLISTS
			div(class="bg-brand-green col-span-full lg:col-span-1 max-lg:order-3 flex flex-col gap-8")
				h6 Playlists
				article(v-for="(playlist, idx) in 1" :key="idx" class="flex flex-col gap-6 group cursor-pointer mb-12 last:mb-0")
					h2(class="text-6xl font-extralight") 0{{ playlist}}.
					p(class="text-xl group-hover:text-brand-accent tracking-tight") Grugbox on Apple Music

section#newsletter(class="py-12 lg:py-20 bg-black")
	.container
		div(class="flex flex-wrap items-center")
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 mx-auto flex flex-col gap-4")
					p(class="text-white uppercase text-sm") Subscribe to the
					h2(class="text-5xl lg:text-6xl font-black text-white") GRUGBOX #[br] #[span(class="text-brand-accent") DIGEST]
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 flex flex-col gap-6")
					p(class="text-white") The most important stories and least important memes, every Friday.
					button(class="bg-brand-accent w-1/2 p-4 text-white uppercase border border-white font-bold") subscribe
</template>