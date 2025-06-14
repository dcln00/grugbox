<script setup lang="ts">
const route = useRoute()

const formatSlug = computed(() => {
  const slug = route.params.slug as string
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

const { data: post } = await useAsyncData(`${route.params.slug}`, () => {
  return queryCollection('articles').path(`/articles/${route.params.slug}`).first()
})
</script>

<template lang="pug">
section#hero(class="pt-20")
	.container
		div(class="space-y-16")
			.title(class="space-y-8")
				h1(class="text-2xl lg:text-7xl tracking-tight") {{ post.title }}
				hr(class="border-zinc-200")
				.author-date(class="flex gap-4 *:tracking-tight")
					p By #[span(class="text-brand-accent") Grugbox]
					p Published #[NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" relative)]
			.photo(class="w-full lg:h-96 pointer-events-none")
				NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center")
section#post(class="py-20")
	div(class="max-lg:container")
		div(class="lg:w-1/2 mx-auto space-y-12")
			ContentRenderer(v-if="post" :value="post" class="prose max-w-none prose-a:no-underline prose-h2:pb-4 prose-h1:font-normal prose-h1:text-xl prose-p:text-zinc-600")
			.tags(class="flex items-center gap-4" v-if="post.tags?.length")
				p(class="text-xs uppercase") tags: 
				div(v-for="tag in post.tags" class="uppercase text-zinc-400 text-xs border px-4 py-2 hover:bg-black hover:text-white hover:border-0 duration-300") {{ tag }}
</template>  