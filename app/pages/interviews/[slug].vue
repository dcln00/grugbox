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

const { data: allInterviews } = await useAsyncData('sidebar-popular-interviews', () => {
  return queryCollection('interviews')
	.select('title', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.limit(6)
	.all()
})

const popularPosts = computed(() => {
  return allInterviews.value?.filter(item => item.path !== post.value?.path).slice(0, 3) ?? []
})

const primaryTag = (tags: string[] = []): string => tags.find(tag => tag !== 'trending') ?? ''

const shareUrl = computed(() => `https://grugbox.com${post.value?.path || ''}`)

const currentArticleTitle = useState<string | null>('currentArticleTitle', () => null)
if (post.value) {
  currentArticleTitle.value = post.value.title
}
watch(() => post.value?.title, (t) => {
  currentArticleTitle.value = t || null
})
onBeforeUnmount(() => {
  currentArticleTitle.value = null
})

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

useSeoMeta({
	description: () => post.value?.description || `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	ogDescription: () => post.value?.description || `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	twitterDescription: () => post.value?.description || `Read the latest interview on Grugbox about ${formatSlug.value}.`,
	ogImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
	twitterImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1751375431/Grugbox/grugbox-og.png',
})
</script>

<template lang="pug">
article#article(v-if="post")
	//- FULL-WIDTH CINEMATIC HERO HEADER matching reference
	header#hero(class="relative w-full min-h-[460px] sm:min-h-[520px] lg:h-[65vh] lg:min-h-[560px] flex items-center justify-center overflow-hidden bg-black")
		//- Background featured image
		NuxtImg(
			:src="post.image"
			alt="featured image"
			class="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
		)
		//- Dark overlay for legibility matching reference
		div(class="absolute inset-0 bg-black/30 pointer-events-none")
		//- Centered hero content
		div(class="container relative z-10 py-16 sm:py-20 flex flex-col items-center text-center gap-3 max-w-4xl")
			span(class="text-[10px] tracking-widest text-white uppercase") {{ post.category || primaryTag(post.tags) || 'Interview' }}
			h1(class="text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight sm:leading-tight") {{ post.title }}
			//- Author byline with circular avatar matching reference
			div(class="flex items-center gap-3.5 mt-2 sm:mt-4")
				span(class="text-[10px] uppercase tracking-widest text-neutral-300") By Grugbox
				NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" class="text-[10px] uppercase tracking-widest text-neutral-300")

	//- MAIN TWO-COLUMN LAYOUT — article body on left, sidebar on right
	section#content(class="py-12 lg:py-16")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Share Icons + Prose (Featured image moved to hero header)
				div(class="lg:col-span-8 flex flex-col gap-10")
					//- Floating Share Icons + Article Content
					div(class="flex flex-col md:flex-row gap-6 lg:gap-10 items-start")
						//- Floating vertical share icons (sticky on desktop)
						aside(aria-label="Share interview" class="flex md:flex-col border border-zinc-200 bg-white md:sticky md:top-28 shrink-0 divide-x md:divide-x-0 md:divide-y divide-zinc-200 shadow-xs z-0")
							a(:href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-facebook(class="size-4")
							a(:href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on X" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-x(class="size-4")
							a(:href="`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(post.title)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-pinterest(class="size-4")

						//- Article Markdown Content
						div(class="flex-1 min-w-0 flex flex-col gap-8")
							ContentRenderer(:value="post" class="prose max-w-none prose-p:text-base prose-p:text-zinc-500 prose-p:leading-relaxed prose-a:text-brand-accent prose-a:underline hover:prose-a:text-black prose-headings:text-black prose-headings:underline prose-headings:font-bold prose-headings:tracking-tight prose-img:rounded-none prose-img:mx-auto prose-img:block")
							
							//- Tags
							div(class="flex flex-wrap items-center gap-2 pt-6 border-t border-zinc-200" v-if="post.tags?.length")
								span(class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mr-2") Tags:
								NuxtLink(v-for="tag in post.tags" :key="tag" :to="`/interviews?tag=${tag}`" class="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-100 hover:bg-black hover:text-white px-3 py-1 border border-zinc-200 duration-200") {{ tag }}

				//- RIGHT COLUMN: Popular Posts + 336x280 Ad Banner
				aside(class="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 self-start")
					//- Popular Posts Box
					div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6 border border-zinc-100")
						div(class="flex flex-col gap-2")
							h2(class="text-xs font-bold tracking-wide uppercase") Popular Interviews
							div(class="flex items-center")
								div(class="h-px w-10 shrink-0 bg-black")
								div(class="h-px flex-1 bg-zinc-200")
						div(class="flex flex-col divide-y divide-zinc-200/70")
							article(v-for="item in popularPosts" :key="item.path" class="group flex gap-4 items-start py-5 first:pt-0 last:pb-0")
								div(class="photo size-20 shrink-0 bg-zinc-200 overflow-hidden")
									NuxtLink(:to="item.path")
										NuxtImg(:src="item.image" alt="" class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
								div(class="flex flex-col gap-1 min-w-0")
									span(class="text-[9px] uppercase font-medium tracking-wide text-neutral-500") {{ primaryTag(item.tags) }}
									NuxtLink(:to="item.path")
										h3(class="text-sm leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ item.title }}
									NuxtTime(:datetime="item.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5")

					//- 336 x 280 Ad Banner
					div(class="flex justify-center")
						//- h-70 = 280px, max-w-84 = 336px
						div(class="flex flex-col items-center justify-center gap-1 h-70 w-full max-w-84 bg-zinc-200 text-zinc-500 border border-zinc-300/50")
							span(class="text-[10px] uppercase tracking-widest font-medium") 336 x 280 AD
</template>
