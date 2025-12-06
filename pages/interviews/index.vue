<script setup lang="ts">
useHead({
	title: 'Interviews - Grugbox',
})

useSeoMeta({
	description: 'Exclusive interviews with artists, creators, and cultural icons from Ghana and beyond.',
	ogDescription: 'Exclusive interviews with artists, creators, and cultural icons from Ghana and beyond.',
	twitterDescription: 'Exclusive interviews with artists, creators, and cultural icons from Ghana and beyond.',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})

const { data: interviews } = await useAsyncData('interviews', () => {
  return queryCollection('interviews')
	.select('title', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	.container
		div(class="flex flex-col gap-8")
			h1(class="text-4xl lg:text-7xl tracking-tight") Interviews
			hr(class="border-zinc-200")
			p(class="text-zinc-600 lg:w-1/2") Exclusive conversations with artists, creators, and cultural icons shaping the Ghanaian creative scene and beyond.

section#interviews(class="py-12 lg:py-20")
	.container
		div(v-if="interviews?.length" class="flex flex-col gap-16")
			//- Featured Interview
			article(v-if="interviews[0]" class="group")
				div(class="grid lg:grid-cols-2 gap-8")
					.photo(class="aspect-video bg-gray-200 overflow-hidden")
						NuxtLink(:to="interviews[0].path")
							NuxtImg(:src="interviews[0].image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
					div(class="flex flex-col justify-center gap-4")
						NuxtLink(:to="interviews[0].path")
							h2(class="text-3xl lg:text-5xl group-hover:text-brand-accent tracking-tight duration-300") {{ interviews[0].title }}
						NuxtTime(:datetime="interviews[0].date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
						.tags(class="flex flex-wrap gap-2" v-if="interviews[0].tags?.length")
							span(v-for="tag in interviews[0].tags" class="uppercase text-zinc-400 text-xs border px-3 py-1") {{ tag }}

			//- Interview Grid
			div(class="grid lg:grid-cols-3 gap-8")
				article(v-for="(interview, idx) in interviews.slice(1)" :key="idx" class="group")
					div(class="flex flex-col gap-4")
						.photo(class="aspect-video bg-gray-200 overflow-hidden")
							NuxtLink(:to="interview.path")
								NuxtImg(:src="interview.image" alt="featured image" class="w-full h-full object-cover object-center group-hover:scale-110 duration-700 group-hover:rotate-3")
						div(class="flex flex-col gap-3")
							NuxtLink(:to="interview.path")
								p(class="text-xl group-hover:text-brand-accent tracking-tight duration-300") {{ interview.title }}
							NuxtTime(:datetime="interview.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
							.tags(class="flex flex-wrap gap-2" v-if="interview.tags?.length")
								span(v-for="tag in interview.tags" class="uppercase text-zinc-400 text-xs border px-2 py-1") {{ tag }}

		//- Empty State
		div(v-else class="text-center py-20")
			p(class="text-zinc-500 text-lg") No interviews yet. Check back soon!
</template>

