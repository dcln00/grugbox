<script setup lang="ts">
const route = useRoute()

const formatSlug = computed(() => {
  const slug = route.params.slug as string
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
})

const { data: post } = await useAsyncData(`review-${route.params.slug}`, () => {
  return queryCollection('reviews').path(`/reviews/${route.params.slug}`).first()
})

if (!post.value) {
  throw createError({ status: 404, statusText: 'Review not found', fatal: true })
}

const { data: allReviews } = await useAsyncData('sidebar-top-reviews', () => {
  return queryCollection('reviews')
	.select('title', 'path', 'image', 'date', 'tags', 'score')
	.all()
})

const TOP_REVIEW_COUNT = 4
const UNSCORED = -1

const topReviews = computed(() => {
  return (allReviews.value ?? [])
    .filter(item => item.path !== post.value?.path)
    .sort((a, b) => (b.score ?? UNSCORED) - (a.score ?? UNSCORED))
    .slice(0, TOP_REVIEW_COUNT)
})

const leadReview = computed(() => topReviews.value[0])
const rankedReviews = computed(() => topReviews.value.slice(1))

const primaryTag = (tags: string[] = []): string => tags.find(tag => tag !== 'trending') ?? ''

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

const defaultGood = [
  'Narrative offers dozens of branching paths with varying outcomes',
  'Choices matter in big ways and affect the rest of the game',
  'Actor performances are incredibly good',
]

const defaultBad = [
  'Camera angles are unflattering',
  'Story gets predictable at its midpoint',
]

const goodPoints = computed(() => {
  let list = post.value?.good
  if (typeof list === 'string') {
    try {
      const parsed = JSON.parse(list)
      if (Array.isArray(parsed)) list = parsed
    } catch {}
  }
  if (list && Array.isArray(list) && list.length > 0) {
    return list
  }
  return defaultGood
})

const badPoints = computed(() => {
  let list = post.value?.bad
  if (typeof list === 'string') {
    try {
      const parsed = JSON.parse(list)
      if (Array.isArray(parsed)) list = parsed
    } catch {}
  }
  if (list && Array.isArray(list) && list.length > 0) {
    return list
  }
  return defaultBad
})

const displayRating = computed(() => {
  if (post.value?.score !== undefined && post.value?.score !== null) {
    return `${post.value.score} / 10`
  }
  return null
})

const displayReleaseDate = computed(() => {
  if (post.value?.releaseDate) return post.value.releaseDate
  if (post.value?.date) {
    return new Date(post.value.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  return null
})

const displayKeyTracks = computed(() => {
  const tracks = post.value?.keyTracks
  if (!tracks) return null
  if (Array.isArray(tracks)) return tracks.join(', ')
  if (typeof tracks === 'string') {
    try {
      const parsed = JSON.parse(tracks)
      if (Array.isArray(parsed)) return parsed.join(', ')
    } catch {}
    return tracks
  }
  return String(tracks)
})

useHead({
	title: () => `${formatSlug.value} - Grugbox`,
})

useSeoMeta({
	description: () => post.value?.description || `Read the latest review on Grugbox about ${formatSlug.value}.`,
	ogDescription: () => post.value?.description || `Read the latest review on Grugbox about ${formatSlug.value}.`,
	twitterDescription: () => post.value?.description || `Read the latest review on Grugbox about ${formatSlug.value}.`,
	ogImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1791564146/Grugbox/grugbox-og.jpg',
	ogImageWidth: 1200,
	ogImageHeight: 630,
	twitterCard: 'summary_large_image',
	twitterImage: post.value?.image || 'https://res.cloudinary.com/dyr6sb7gn/image/upload/v1791564146/Grugbox/grugbox-og.jpg',
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
				div(class="flex flex-wrap items-center gap-4")
					p(class="text-[10px] uppercase tracking-widest text-zinc-500") By Grugbox · #[NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric")]
				
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — article body on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Featured Image + Share Icons + Prose
				div(class="lg:col-span-8 flex flex-col gap-10")
					//- Featured hero image with subtle credit tag
					div(class="relative aspect-3/2 lg:aspect-16/10 overflow-hidden bg-zinc-100")
						NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center select-none pointer-events-none")
						span(class="absolute bottom-3 right-3 text-[9px] uppercase tracking-widest text-white/80 bg-black/50 px-2 py-0.5 backdrop-blur-xs") Grugbox Media

					//- Floating Share Icons + Article Content
					div(class="flex flex-col md:flex-row gap-6 lg:gap-10 items-start")
						//- Floating vertical share icons (sticky on desktop)
						aside(aria-label="Share review" class="flex md:flex-col border border-zinc-200 bg-white md:sticky md:top-28 shrink-0 divide-x md:divide-x-0 md:divide-y divide-zinc-200 z-0")
							a(:href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-facebook(class="size-4")
							a(:href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on X" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-x(class="size-4")
							a(:href="`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(post.title)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
								svg-socials-pinterest(class="size-4")

						//- Article Markdown Content
						div(class="flex-1 min-w-0 flex flex-col gap-8")
							//- Review Scorecard (The Metadata + The Good / The Bad / Score)
							div(class="border border-zinc-200 p-6 sm:p-8 flex flex-col gap-6 bg-white")
								//- Top: Title & Metadata Rows (Rating, Release Date, Key Tracks)
								div(class="flex flex-col gap-4")
									h3(class="text-xs sm:text-sm font-bold uppercase tracking-wider text-black") {{ post.albumTitle || post.title }}
									div(class="flex flex-col divide-y divide-zinc-100")
										div(v-if="displayRating" class="flex items-center justify-between py-2.5")
											span(class="text-xs sm:text-sm font-medium text-zinc-900") Rating
											span(class="text-xs sm:text-sm font-semibold text-zinc-900") {{ displayRating }}
										div(v-if="displayReleaseDate" class="flex items-center justify-between py-2.5")
											span(class="text-xs sm:text-sm font-medium text-zinc-900") Release Date
											span(class="text-xs sm:text-sm text-zinc-600") {{ displayReleaseDate }}
										div(v-if="displayKeyTracks" class="flex items-start sm:items-center justify-between py-2.5 gap-4")
											span(class="text-xs sm:text-sm font-medium text-zinc-900 shrink-0") Key Tracks
											span(class="text-xs sm:text-sm text-zinc-600 text-right max-w-xs sm:max-w-md md:max-w-lg") {{ displayKeyTracks }}

								//- Divider between metadata and highlights
								div(class="h-px w-full bg-zinc-200")

								//- Bottom: The Good, The Bad & Score
								div(class="flex flex-col lg:flex-row gap-8 lg:gap-6 items-start lg:items-center justify-between")
									//- Two columns: The Good & The Bad
									div(class="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1")
										//- THE GOOD
										div(class="flex flex-col gap-4")
											h4(class="text-xs font-bold uppercase tracking-wider text-black") THE GOOD
											ul(class="flex flex-col gap-3.5")
												li(v-for="item in goodPoints" :key="item" class="flex items-start gap-3")
													span(class="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5")
														svg(class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round")
															path(d="M12 5v14M5 12h14")
													span(class="text-sm text-zinc-600 leading-snug") {{ item }}

										//- THE BAD
										div(class="flex flex-col gap-4")
											h4(class="text-xs font-bold uppercase tracking-wider text-black") THE BAD
											ul(class="flex flex-col gap-3.5")
												li(v-for="item in badPoints" :key="item" class="flex items-start gap-3")
													span(class="size-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5")
														svg(class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round")
															path(d="M5 12h14")
													span(class="text-sm text-zinc-600 leading-snug") {{ item }}

									//- Score Box on the Right
									div(v-if="post.score" class="w-full sm:w-auto flex justify-center lg:justify-end shrink-0")
										div(class="size-32 sm:size-36 md:size-40 bg-[#22c7ff] flex items-center justify-center shrink-0")
											span(class="text-6xl md:text-7xl font-bold text-white tracking-tight") {{ post.score }}

							ContentRenderer(:value="post" class="prose max-w-none prose-p:text-base prose-p:text-zinc-500 prose-p:leading-relaxed prose-a:text-brand-accent prose-a:underline hover:prose-a:text-black prose-headings:text-black prose-headings:underline prose-headings:font-bold prose-headings:tracking-tight prose-img:rounded-none prose-img:mx-auto prose-img:block")
							
							//- Tags
							div(class="flex flex-wrap items-center gap-2 pt-6 border-t border-zinc-200" v-if="post.tags?.length")
								span(class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mr-2") Tags:
								NuxtLink(v-for="tag in post.tags" :key="tag" :to="`/reviews?tag=${tag}`" class="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-100 hover:bg-black hover:text-white px-3 py-1 border border-zinc-200 duration-200") {{ tag }}

				//- RIGHT COLUMN: Popular Posts + 336x280 Ad Banner
				aside(class="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 self-start")
					//- Top Reviews Box
					div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6 border border-zinc-100")
						div(class="flex flex-col gap-2")
							h2(class="text-xs font-bold tracking-wide uppercase") Top Reviews
							div(class="flex items-center")
								div(class="h-px w-10 shrink-0 bg-black")
								div(class="h-px flex-1 bg-zinc-200")

						//- Lead Top Review
						article(v-if="leadReview" class="group flex flex-col gap-3 pb-6 border-b border-zinc-200/70")
							div(class="photo relative aspect-16/10 bg-zinc-200 overflow-hidden")
								NuxtLink(:to="leadReview.path")
									NuxtImg(:src="leadReview.image" alt="" class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
								span(v-if="leadReview.score" class="absolute top-3 right-3 px-2.5 py-1 bg-black text-white text-xs font-bold") {{ leadReview.score }}
							div(class="flex flex-col gap-1")
								span(class="text-[9px] uppercase font-medium tracking-wide text-neutral-500") {{ primaryTag(leadReview.tags) }}
								NuxtLink(:to="leadReview.path")
									h3(class="text-sm sm:text-base font-semibold leading-snug tracking-tight duration-300 group-hover:text-brand-accent") {{ leadReview.title }}
								NuxtTime(:datetime="leadReview.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5")

						//- Ranked Reviews
						div(v-if="rankedReviews.length" class="flex flex-col divide-y divide-zinc-200/70")
							article(v-for="item in rankedReviews" :key="item.path" class="group flex gap-4 items-start py-4 first:pt-0 last:pb-0")
								div(class="photo size-16 shrink-0 bg-zinc-200 overflow-hidden")
									NuxtLink(:to="item.path")
										NuxtImg(:src="item.image" alt="" class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
								div(class="flex flex-col gap-1 min-w-0 flex-1")
									span(class="text-[9px] uppercase font-medium tracking-wide text-neutral-500") {{ primaryTag(item.tags) }}
									NuxtLink(:to="item.path")
										h3(class="text-xs leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ item.title }}
									NuxtTime(:datetime="item.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5")
								div(v-if="item.score" class="shrink-0 self-center pl-2")
									span(class="text-sm font-bold text-zinc-900") {{ item.score }}

					//- 336 x 280 Ad Banner
					div(class="flex justify-center")
						//- h-70 = 280px, max-w-84 = 336px
						div(class="flex flex-col items-center justify-center gap-1 h-70 w-full max-w-84 bg-zinc-200 text-zinc-500 border border-zinc-300/50")
							span(class="text-[10px] uppercase tracking-widest font-medium") 336 x 280 AD
</template>
