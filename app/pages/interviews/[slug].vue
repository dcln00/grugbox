<script setup lang="ts">
const route = useRoute()

const formatSlug = computed(() => {
  const slug = route.params.slug as string
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const { data: post } = await useAsyncData(`interview-${route.params.slug}`, () => {
  return queryCollection('interviews').path(`/interviews/${route.params.slug}`).first()
})

if (!post.value) {
  throw createError({ status: 404, statusText: 'Interview not found', fatal: true })
}

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

useSeoMeta({
	description: `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	ogDescription: `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	twitterDescription: `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	ogImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})
</script>

<template lang="pug">
section#hero(class="pt-12 lg:pt-20")
	div(class="container")
		div(class="flex flex-col gap-12 lg:gap-16")
			div(class="title flex flex-col gap-4 lg:gap-8")
				h1(class="text-2xl lg:text-7xl tracking-tight") {{ post.title }}
				hr(class="border-zinc-200")
				div(class="author-date flex gap-4 *:tracking-tight")
					p By #[span(class="text-brand-accent") Grugbox]
					p Published #[NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative)]
			div(class="photo w-full lg:aspect-video pointer-events-none")
				NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center")
section#post(class="py-12 lg:py-20")
	div(class="max-lg:container")
		div(class="lg:w-1/2 mx-auto flex flex-col gap-12")
			ContentRenderer(v-if="post" :value="post" class="prose max-w-none prose-a:no-underline prose-h2:pb-4 prose-h1:font-normal prose-h1:text-xl prose-p:text-zinc-600")
			div(class="tags flex items-center gap-4" v-if="post.tags?.length")
				p(class="text-xs uppercase") tags: 
				div(v-for="tag in post.tags" class="uppercase text-zinc-400 text-xs border px-4 py-2 hover:bg-black hover:text-white hover:border-0 duration-300") {{ tag }}
</template>

