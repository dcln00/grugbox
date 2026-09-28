<script setup lang="ts">
useHead({
	title: 'Articles - Grugbox',
})

useSeoMeta({
	description: 'Music, culture and lifestyle stories from Ghana and beyond.',
	ogDescription: 'Music, culture and lifestyle stories from Ghana and beyond.',
	twitterDescription: 'Music, culture and lifestyle stories from Ghana and beyond.',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})

const { data: articles } = await useAsyncData('articles', () => {
  return queryCollection('articles')
	.select('title', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	div(class="container")
		div(class="flex flex-col gap-8")
			h1(class="text-4xl lg:text-7xl tracking-tight") Articles
			hr(class="border-zinc-200")
			p(class="text-zinc-600 lg:w-1/2") Music, culture and lifestyle stories from Ghana and beyond.

section#articles(class="py-12 lg:py-20")
	div(class="container")
		div(v-if="articles?.length" class="flex flex-col gap-16")
			//- Featured Article
			article(v-if="articles[0]" class="group")
				div(class="grid lg:grid-cols-2 gap-8")
					div(class="photo aspect-video bg-gray-200 overflow-hidden")
						NuxtLink(:to="articles[0].path")
							NuxtImg(:src="articles[0].image" alt="featured image" class="w-full h-full object-cover object-center duration-700 group-hover:rotate-3")
					div(class="flex flex-col justify-center gap-4")
						NuxtLink(:to="articles[0].path")
							h2(class="text-3xl lg:text-5xl group-hover:text-brand-accent tracking-tight duration-300") {{ articles[0].title }}
						NuxtTime(:datetime="articles[0].date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
						div(class="tags flex flex-wrap gap-2" v-if="articles[0].tags?.length")
							span(v-for="tag in articles[0].tags" class="uppercase text-zinc-400 text-xs border px-3 py-1") {{ tag }}

			//- Article Grid
			div(class="grid lg:grid-cols-3 gap-8")
				article(v-for="(article, idx) in articles.slice(1)" :key="idx" class="group")
					div(class="flex flex-col gap-4")
						div(class="photo aspect-video bg-gray-200 overflow-hidden")
							NuxtLink(:to="article.path")
								NuxtImg(:src="article.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 group-hover:rotate-3")
						div(class="flex flex-col gap-3")
							NuxtLink(:to="article.path")
								p(class="text-xl group-hover:text-brand-accent tracking-tight duration-300") {{ article.title }}
							NuxtTime(:datetime="article.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
							div(class="tags flex flex-wrap gap-2" v-if="article.tags?.length")
								span(v-for="tag in article.tags" class="uppercase text-zinc-400 text-xs border px-2 py-1") {{ tag }}

		//- Empty State
		div(v-else class="text-center py-20")
			p(class="text-zinc-500 text-lg") No articles yet. Check back soon!
</template>
