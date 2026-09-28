<script setup lang="ts">
useHead({
	title: 'Reviews - Grugbox',
})

useSeoMeta({
	description: 'Albums, EPs and singles from Ghana and beyond, reviewed.',
	ogDescription: 'Albums, EPs and singles from Ghana and beyond, reviewed.',
	twitterDescription: 'Albums, EPs and singles from Ghana and beyond, reviewed.',
	ogImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})

const { data: reviews } = await useAsyncData('reviews', () => {
  return queryCollection('reviews')
	.select('title', 'path', 'image', 'date', 'tags', 'score')
	.order('date', 'DESC')
	.all()
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	div(class="container")
		div(class="flex flex-col gap-8")
			h1(class="text-4xl lg:text-7xl tracking-tight") Reviews
			hr(class="border-zinc-200")
			p(class="text-zinc-600 lg:w-1/2") Albums, EPs and singles from Ghana and beyond, reviewed.

section#reviews(class="py-12 lg:py-20")
	div(class="container")
		div(v-if="reviews?.length" class="flex flex-col gap-16")
			//- Featured Review
			article(v-if="reviews[0]" class="group")
				div(class="grid lg:grid-cols-2 gap-8")
					div(class="photo relative aspect-video bg-gray-200 overflow-hidden")
						NuxtLink(:to="reviews[0].path")
							NuxtImg(:src="reviews[0].image" alt="featured image" class="w-full h-full object-cover object-center duration-700 group-hover:rotate-3")
						span(v-if="reviews[0].score" class="absolute top-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-accent bg-black/40 text-lg font-bold text-white backdrop-blur-sm") {{ reviews[0].score }}
					div(class="flex flex-col justify-center gap-4")
						NuxtLink(:to="reviews[0].path")
							h2(class="text-3xl lg:text-5xl group-hover:text-brand-accent tracking-tight duration-300") {{ reviews[0].title }}
						NuxtTime(:datetime="reviews[0].date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
						div(class="tags flex flex-wrap gap-2" v-if="reviews[0].tags?.length")
							span(v-for="tag in reviews[0].tags" class="uppercase text-zinc-400 text-xs border px-3 py-1") {{ tag }}

			//- Review Grid
			div(class="grid lg:grid-cols-3 gap-8")
				article(v-for="(review, idx) in reviews.slice(1)" :key="idx" class="group")
					div(class="flex flex-col gap-4")
						div(class="photo relative aspect-video bg-gray-200 overflow-hidden")
							NuxtLink(:to="review.path")
								NuxtImg(:src="review.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 group-hover:rotate-3")
							span(v-if="review.score" class="absolute top-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-accent bg-black/40 text-base font-bold text-white backdrop-blur-sm") {{ review.score }}
						div(class="flex flex-col gap-3")
							NuxtLink(:to="review.path")
								p(class="text-xl group-hover:text-brand-accent tracking-tight duration-300") {{ review.title }}
							NuxtTime(:datetime="review.date" month="long" day="numeric" year="numeric" relative class="text-xs uppercase tracking-tight text-zinc-600")
							div(class="tags flex flex-wrap gap-2" v-if="review.tags?.length")
								span(v-for="tag in review.tags" class="uppercase text-zinc-400 text-xs border px-2 py-1") {{ tag }}

		//- Empty State
		div(v-else class="text-center py-20")
			p(class="text-zinc-500 text-lg") No reviews yet. Check back soon!
</template>
