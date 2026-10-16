<script setup lang="ts">
const route = useRoute()

const formatSlug = computed(() => {
  const slug = route.params.slug as string
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const { data: post } = await useAsyncData(`article-${route.params.slug}`, () => {
  return queryCollection('articles').path(`/articles/${route.params.slug}`).first()
})

if (!post.value) {
  throw createError({ status: 404, statusText: 'Article not found', fatal: true })
}

const { data: allArticles } = await useAsyncData('sidebar-popular-articles', () => {
  return queryCollection('articles')
	.select('title', 'path', 'image', 'video', 'date', 'category', 'tags')
	.order('date', 'DESC')
	.limit(6)
	.all()
})

const popularPosts = computed(() => {
  return allArticles.value?.filter(item => item.path !== post.value?.path).slice(0, 3) ?? []
})

const primaryTag = (tags?: string[] | null): string => tags?.find(tag => tag !== 'trending') ?? ''

const shareUrl = computed(() => `https://grugbox.world${post.value?.path || ''}`)

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

const siteConfig = useSiteConfig()

const postOgImage = computed(() => resolveOgImage(post.value?.image, siteConfig.url))

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

useSeoMeta({
	description: () => post.value?.description || `Read the latest article on Grugbox about ${formatSlug.value}.`,
	ogDescription: () => post.value?.description || `Read the latest article on Grugbox about ${formatSlug.value}.`,
	twitterDescription: () => post.value?.description || `Read the latest article on Grugbox about ${formatSlug.value}.`,
	ogImage: () => postOgImage.value,
	twitterCard: 'summary_large_image',
	twitterImage: () => postOgImage.value,
})
</script>

<template lang="pug">
article#article(v-if="post")
	//- HEADER SECTION — title, category & byline styled after profiles section
	header#header(class="pt-10 lg:pt-16 pb-8")
		div(class="container")
			div(class="flex flex-col gap-4 max-w-4xl")
				span(v-if="post.category || post.tags?.[0]" class="text-[11px] font-medium uppercase tracking-wide text-neutral-600 underline underline-offset-4") {{ post.category || primaryTag(post.tags) }}
				h1(class="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") {{ post.title }}
				p(class="text-[10px] uppercase tracking-widest text-zinc-500") By {{ post.author }} · #[NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric")]
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — article body on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Featured Image + Share Icons + Prose
				div(class="lg:col-span-8 flex flex-col gap-10")
					//- Featured hero media with subtle credit tag
					div(class="relative aspect-3/2 lg:aspect-16/10 overflow-hidden bg-zinc-100")
						video(v-if="isVideo(post.video || post.image)" :src="post.video || post.image" :poster="!isVideo(post.image) ? post.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center select-none pointer-events-none")
						NuxtImg(v-else :src="post.image" alt="featured image" class="w-full h-full object-cover object-center select-none pointer-events-none")
						span(class="absolute bottom-3 right-3 text-[9px] uppercase tracking-widest text-white/80 bg-black/50 px-2 py-0.5 backdrop-blur-xs") Grugbox Media

					//- Floating Share Icons + Article Content
					div(class="flex flex-col md:flex-row gap-6 lg:gap-10 items-start")
						//- Floating vertical share icons (sticky on desktop)
						share-aside(:url="shareUrl" :title="post.title" label="Share article")

						//- Article Markdown Content
						div(class="flex-1 min-w-0 flex flex-col gap-8")
							ContentRenderer(:value="post" class="prose max-w-none prose-p:text-base prose-p:text-zinc-500 prose-p:leading-relaxed prose-a:text-brand-accent prose-a:underline hover:prose-a:text-black prose-headings:text-black prose-headings:underline prose-headings:font-bold prose-headings:tracking-tight prose-img:rounded-none prose-img:mx-auto prose-img:block")
							
							//- Tags
							div(class="flex flex-wrap items-center gap-2 pt-6 border-t border-zinc-200" v-if="post.tags?.length")
								span(class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mr-2") Tags:
								NuxtLink(v-for="tag in post.tags" :key="tag" :to="`/articles?tag=${tag}`" class="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-100 hover:bg-black hover:text-white px-3 py-1 border border-zinc-200 duration-200") {{ tag }}

				//- RIGHT COLUMN: Popular Posts + 336x280 Ad Banner
				aside(class="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 self-start")
					//- Popular Posts Box
					div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6 border border-zinc-100")
						div(class="flex flex-col gap-2")
							h2(class="text-xs font-bold tracking-wide uppercase") Popular Posts
							div(class="flex items-center")
								div(class="h-px w-10 shrink-0 bg-black")
								div(class="h-px flex-1 bg-zinc-200")
						div(class="flex flex-col divide-y divide-zinc-200/70")
							article(v-for="item in popularPosts" :key="item.path" class="group flex gap-4 items-start py-5 first:pt-0 last:pb-0")
								div(class="photo size-20 shrink-0 bg-zinc-200 overflow-hidden")
									NuxtLink(:to="item.path")
										video(v-if="isVideo(item.video || item.image)" :src="item.video || item.image" autoplay loop muted playsinline class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
										NuxtImg(v-else :src="item.image" alt="" class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
								div(class="flex flex-col gap-1 min-w-0")
									span(class="text-[9px] uppercase font-medium tracking-wide text-neutral-500") {{ item.category || primaryTag(item.tags) }}
									NuxtLink(:to="item.path")
										h3(class="text-sm leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ item.title }}
									NuxtTime(:datetime="item.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5")

					//- 336 x 280 Ad Banner
					div(class="flex justify-center")
						//- h-70 = 280px, max-w-84 = 336px
						div(class="flex flex-col items-center justify-center gap-1 h-70 w-full max-w-84 bg-zinc-200 text-zinc-500 border border-zinc-300/50")
							span(class="text-[10px] uppercase tracking-widest font-medium") 336 x 280 AD
</template>