<script setup lang="ts">
const { data: posts } = await useAsyncData('posts', () => {
  return queryCollection('articles')
	.select('title', 'description', 'path', 'image', 'video', 'date', 'tags', 'category')
	.order('date', 'DESC')
	.all()
})

const { data: playlists } = await useAsyncData('playlists', () => {
  return queryCollection('playlists')
	.select('title', 'path', 'image', 'date')
	.order('date', 'DESC')
	.all()
})

const { data: reviews } = await useAsyncData('home-reviews', () => {
  return queryCollection('reviews')
	.select('title', 'path', 'image', 'date', 'score')
	.order('date', 'DESC')
	.all()
})

const { data: interviews } = await useAsyncData('home-interviews', () => {
  return queryCollection('interviews')
	.select('title', 'description', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})

const leadInterview = computed(() => interviews.value?.[0])
const secondInterview = computed(() => interviews.value?.[1])

const TRENDING_TAG = 'trending'

const trending = computed(() => posts.value?.filter(post => post.tags?.includes(TRENDING_TAG)) ?? [])
const latest = computed(() => posts.value?.filter(post => !post.tags?.includes(TRENDING_TAG)) ?? [])

//- Hero leads with the newest trending article at double width, second fills the third column
const heroLead = computed(() => trending.value[0])
const heroSecond = computed(() => trending.value[1])

const primaryTag = (tags?: string[] | null): string => tags?.find(tag => tag !== TRENDING_TAG) ?? ''

//- "More From Grugbox" opens with six cards, then reveals three more per click
const INITIAL_VISIBLE = 6
const MORE_STEP = 3

const moreVisible = ref(INITIAL_VISIBLE)

const morePosts = computed(() => posts.value ?? [])
const visibleMore = computed(() => morePosts.value.slice(0, moreVisible.value))
const hasMore = computed(() => moreVisible.value < morePosts.value.length)

const showMore = (): void => {
  moreVisible.value += MORE_STEP
}

//- Profiles block: the `profile` category, led by one article and followed by a compact list
const PROFILE_CATEGORY = 'profile'
const LEAD_COUNT = 1
const COMPACT_PROFILE_COUNT = 4

const profiles = computed(() => posts.value?.filter(post => post.category === PROFILE_CATEGORY) ?? [])
const leadProfile = computed(() => profiles.value[0])
const compactProfiles = computed(() =>
  profiles.value.slice(LEAD_COUNT, LEAD_COUNT + COMPACT_PROFILE_COUNT),
)

//- Editorial block: the `editorial` category, led by one hero article and followed by two grid articles
const EDITORIAL_CATEGORY = 'editorial'
const EDITORIAL_LEAD_COUNT = 1
const EDITORIAL_GRID_COUNT = 2

const editorials = computed(() => posts.value?.filter(post => post.category === EDITORIAL_CATEGORY) ?? [])
const leadEditorial = computed(() => editorials.value[0])
const gridEditorials = computed(() =>
  editorials.value.slice(EDITORIAL_LEAD_COUNT, EDITORIAL_LEAD_COUNT + EDITORIAL_GRID_COUNT),
)

//- Top reviews: scored first, highest first. Unscored reviews fall to the bottom and
//- keep the newest-first order the query already gave them.
const TOP_REVIEW_COUNT = 4
const UNSCORED = -1

const topReviews = computed(() =>
  [...(reviews.value ?? [])]
	.sort((a, b) => (b.score ?? UNSCORED) - (a.score ?? UNSCORED))
	.slice(0, TOP_REVIEW_COUNT),
)
const leadReview = computed(() => topReviews.value[0])
const rankedReviews = computed(() => topReviews.value.slice(1))

//- Score fills the row proportionally: a 10 covers it, a 5 covers half
const MAX_SCORE = 10

const scoreWidth = (score?: number): string => `${((score ?? 0) / MAX_SCORE) * 100}%`
</script>

<template lang="pug">
//- AD SLOT — centred 728x90 IAB leaderboard
section(id="ad-top" aria-label="Advertisement" class="py-8")
	div(class="container flex justify-center")
		//- 728x90 IAB leaderboard with responsive aspect ratio scaling
		div(class="relative w-full max-w-182 aspect-[728/90] overflow-hidden min-w-0")
			video(src="/ads/leaderboard-banner.webm" autoplay loop muted playsinline class="block w-full h-full object-cover object-center select-none pointer-events-none")

//- FULL-WIDTH HERO
section(id="hero" aria-label="Top trending" class="grid grid-cols-1 md:grid-cols-3 gap-px")
	article(v-if="heroLead" class="group relative md:col-span-2 h-[60vh] overflow-hidden bg-zinc-800")
		NuxtLink(:to="heroLead.path" class="block w-full h-full")
			video(v-if="isVideo(heroLead.video || heroLead.image)" :src="heroLead.video || heroLead.image" :poster="!isVideo(heroLead.image) ? heroLead.image : undefined" autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none")
			NuxtImg(v-else :src="heroLead.image" alt="" class="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none")
			div(class="absolute right-0 bottom-0 w-full lg:w-3/4 bg-zinc-900 px-6 py-8 flex flex-col items-center gap-4 text-center")
				span(class="text-[11px] uppercase tracking-widest text-neutral-300 underline underline-offset-4") {{ primaryTag(heroLead.tags) }}
				h3(class="text-xl lg:text-3xl text-white tracking-tight duration-300 group-hover:underline") {{ heroLead.title }}
				NuxtTime(:datetime="heroLead.date" month="long" day="numeric" year="numeric" class="text-[11px] uppercase tracking-widest text-neutral-400")
	//- Stacked, not overlaid: image fills the space above, text panel sits below in flow
	article(v-if="heroSecond" class="group md:col-span-1 h-[60vh] bg-zinc-800/")
		NuxtLink(:to="heroSecond.path" class="flex h-full flex-col")
			//- min-h-0 lets the image shrink instead of forcing the panel out of the box
			div(class="flex-1 min-h-0 overflow-hidden")
				video(v-if="isVideo(heroSecond.video || heroSecond.image)" :src="heroSecond.video || heroSecond.image" :poster="!isVideo(heroSecond.image) ? heroSecond.image : undefined" autoplay loop muted playsinline class="h-full w-full object-cover object-center select-none pointer-events-none")
				NuxtImg(v-else :src="heroSecond.image" alt="" class="h-full w-full object-cover object-center select-none pointer-events-none")
			div(class="shrink-0 px-6 py-5 flex flex-col items-start gap-3 ")
				span(class="text-[11px] font-medium uppercase tracking-wide text-neutral-600 underline underline-offset-4") {{ primaryTag(heroSecond.tags) }}
				h3(class="text-xl lg:text-xl tracking-tight duration-300 group-hover:text-brand-accent") {{ heroSecond.title }}
				p(class="text-sm leading-snug text-neutral-600 line-clamp-4") {{ heroSecond.description }}

//- PROFILES + TOP REVIEWS — the profile category beside a review rail ranked by score
section(id="profiles" class="my-20")
	div(class="container")
		div(class="grid grid-cols-1 lg:grid-cols-3 gap-12")
			div(class="lg:col-span-2 flex flex-col gap-16")
				//- Editorial block — lead hero overlay, then two side-by-side cards
				div(class="flex flex-col gap-8")
					div(class="flex flex-col gap-2")
						h2(class="text-xs font-bold tracking-wide uppercase") editorial
						div(class="flex items-center")
							div(class="h-px w-10 shrink-0 bg-black")
							div(class="h-px flex-1 bg-zinc-200")
					article(v-if="leadEditorial" class="group relative aspect-16/12 lg:aspect-video overflow-hidden bg-zinc-900")
						NuxtLink(:to="leadEditorial.path" class="block w-full h-full")
							video(v-if="isVideo(leadEditorial.video || leadEditorial.image)" :src="leadEditorial.video || leadEditorial.image" :poster="!isVideo(leadEditorial.image) ? leadEditorial.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
							NuxtImg(v-else :src="leadEditorial.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
							div(class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center gap-3 duration-300 group-hover:bg-black/50")
								h3(class="text-xl md:text-2xl lg:text-3xl text-white tracking-tight duration-300 group-hover:underline max-w-xl text-center") {{ leadEditorial.title }}
								p(class="text-[10px] uppercase tracking-widest text-zinc-300") By Grugbox · #[NuxtTime(:datetime="leadEditorial.date" month="long" day="numeric" year="numeric")]
					div(class="grid grid-cols-1 md:grid-cols-2 gap-8")
						article(v-for="editorial in gridEditorials" :key="editorial.path" class="group flex flex-col gap-3")
							div(class="photo aspect-video bg-gray-200 overflow-hidden")
								NuxtLink(:to="editorial.path")
									video(v-if="isVideo(editorial.video || editorial.image)" :src="editorial.video || editorial.image" :poster="!isVideo(editorial.image) ? editorial.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
									NuxtImg(v-else :src="editorial.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
							div(class="flex flex-col gap-2")
								NuxtLink(:to="editorial.path")
									h3(class="text-base lg:text-lg leading-snug tracking-tight duration-300 group-hover:text-brand-accent") {{ editorial.title }}
								p(class="text-[10px] uppercase tracking-widest text-zinc-500") #[NuxtTime(:datetime="editorial.date" month="long" day="numeric" year="numeric")]
								p(class="text-sm leading-snug text-zinc-600 line-clamp-3") {{ editorial.description }}

				//- Profile block — one lead article, then a compact list
				div(class="flex flex-col gap-8")
					div(class="flex flex-col gap-2")
						h2(class="text-xs font-bold tracking-wide uppercase") profiles
						div(class="flex items-center")
							div(class="h-px w-10 shrink-0 bg-black")
							div(class="h-px flex-1 bg-zinc-200")
					div(class="grid grid-cols-1 md:grid-cols-2 gap-8")
						article(v-if="leadProfile" class="group flex flex-col gap-4")
							div(class="photo aspect-3/2 bg-gray-200 overflow-hidden")
								NuxtLink(:to="leadProfile.path")
									video(v-if="isVideo(leadProfile.video || leadProfile.image)" :src="leadProfile.video || leadProfile.image" :poster="!isVideo(leadProfile.image) ? leadProfile.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
									NuxtImg(v-else :src="leadProfile.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
							div(class="flex flex-col gap-3")
								NuxtLink(:to="leadProfile.path")
									h3(class="text-xl lg:text-xl tracking-tight duration-300 group-hover:text-brand-accent") {{ leadProfile.title }}
								p(class="text-[10px] uppercase tracking-widest text-zinc-500") By Grugbox · #[NuxtTime(:datetime="leadProfile.date" month="long" day="numeric" year="numeric")]
								p(class="text-sm leading-snug text-zinc-600 line-clamp-2") {{ leadProfile.description }}
						div(class="flex flex-col gap-6")
							article(v-for="profile in compactProfiles" :key="profile.path" class="group flex gap-4")
								div(class="photo h-22.5 w-22.5 shrink-0 bg-gray-200 overflow-hidden")
									NuxtLink(:to="profile.path")
										video(v-if="isVideo(profile.video || profile.image)" :src="profile.video || profile.image" :poster="!isVideo(profile.image) ? profile.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center select-none pointer-events-none")
										NuxtImg(v-else :src="profile.image" alt="featured image" class="w-full h-full object-cover object-center select-none pointer-events-none")
								div(class="flex flex-col gap-2")
									NuxtLink(:to="profile.path")
										h3(class="text-sm leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ profile.title }}
									NuxtTime(:datetime="profile.date" month="long" day="numeric" year="numeric" class="text-[10px] uppercase tracking-widest/ text-zinc-500")

				//- Playlists block — 3-card grid matching the product reference
				div(class="flex flex-col gap-8")
					div(class="flex flex-col gap-2")
						h2(class="text-xs font-bold tracking-wide uppercase") playlists
						div(class="flex items-center")
							div(class="h-px w-10 shrink-0 bg-black")
							div(class="h-px flex-1 bg-zinc-200")
					div(class="grid grid-cols-1 sm:grid-cols-3 gap-6")
						article(v-for="playlist in playlists" :key="playlist.path" class="group flex flex-col gap-3")
							div(class="aspect-square bg-zinc-100 overflow-hidden")
								NuxtLink(:to="playlist.path" class="block w-full h-full")
									NuxtImg(:src="playlist.image" alt="playlist cover" class="w-full h-full object-cover object-center duration-500 select-none pointer-events-none")
							div(class="flex flex-col gap-1")
								NuxtLink(:to="playlist.path")
									h3(class="text-sm lg:text-base tracking-tight duration-300 group-hover:text-brand-accent line-clamp-1") {{ playlist.title }}
								p(class="text-[10px] uppercase text-zinc-500") #[NuxtTime(:datetime="playlist.date" month="long" day="numeric" year="numeric")]

			div(class="lg:col-span-1 lg:sticky lg:top-24 self-start flex flex-col gap-8")
				//- Top reviews block — score ring on the lead, score column on the rows
				div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6")
					div(class="flex flex-col gap-2")
						h2(class="text-xs font-bold uppercase tracking-widest") Top Reviews
						div(class="h-px w-full bg-zinc-200")
					article(v-if="leadReview" class="group relative overflow-hidden bg-zinc-900")
						NuxtLink(:to="leadReview.path" class="block")
							NuxtImg(:src="leadReview.image" alt="featured image" class="w-full aspect-3/2 object-cover object-center select-none pointer-events-none")
							div(v-if="leadReview.score" class="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full border-2 border-green-400 bg-black/40 text-white backdrop-blur-sm") {{ leadReview.score }}
							div(class="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-black/90 to-transparent p-4")
								h3(class="leading-snug tracking-tight text-white duration-300 group-hover:underline") {{ leadReview.title }}
								p(class="text-[9px] uppercase text-white/70") By Grugbox · #[NuxtTime(:datetime="leadReview.date" month="long" day="numeric" year="numeric")]
					div(class="flex flex-col gap-3")
						article(v-for="review in rankedReviews" :key="review.path" class="group relative overflow-hidden bg-zinc-100")
							div(class="absolute inset-y-0 left-0 bg-green-100" :style="{ width: scoreWidth(review.score) }")
							NuxtLink(:to="review.path" class="relative flex items-center justify-between gap-14 px-4 py-4")
								div(class="flex flex-col gap-1")
									h3(class="text-xs leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ review.title }}
									NuxtTime(:datetime="review.date" month="long" day="numeric" year="numeric" class="text-[10px] uppercase text-zinc-500")
								span(v-if="review.score" class="shrink-0 text-lg font-medium") {{ review.score }}

				//- AD SLOT BLOCK — centred 336x280 large rectangle
				div(class="flex justify-center")
					//- h-70 = 280px, max-w-84 = 336px
					div(class="flex h-70 w-full max-w-84 items-center justify-center bg-zinc-300")
						span(class="text-[10px] uppercase tracking-widest text-zinc-500") Advertisement

//- FEATURED INTERVIEWS — 2-column featured layout with light mint wash
section(id="interviews" aria-label="Interviews" class="my-20 py-16 lg:py-20 bg-zinc-50")
	div(class="container")
		div(class="flex items-center justify-between gap-4 mb-10")
			div(class="flex flex-col gap-2 flex-1")
				h2(class="text-xs font-bold tracking-wide uppercase") interviews
				div(class="flex items-center")
					div(class="h-px w-10 shrink-0 bg-black")
					div(class="h-px flex-1 bg-black/10")
		div(class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch")
			//- Lead featured interview with full overlay and Read More button
			article(v-if="leadInterview" class="group relative lg:col-span-2 overflow-hidden bg-zinc-900 min-h-[440px] lg:min-h-[500px] flex flex-col justify-end")
				NuxtLink(:to="leadInterview.path" class="absolute inset-0 block")
					NuxtImg(:src="leadInterview.image" alt="featured interview" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
					div(class="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/20 duration-300 group-hover:from-black/95")
				div(class="relative pointer-events-none p-6 lg:p-10 flex flex-col items-start gap-4")
					span(v-if="leadInterview.tags?.length" class="text-[11px] uppercase tracking-widest text-neutral-300 underline underline-offset-4") {{ leadInterview.tags[0] }}
					NuxtLink(:to="leadInterview.path" class="pointer-events-auto")
						h3(class="text-2xl lg:text-4xl text-white tracking-tight duration-300 group-hover:underline") {{ leadInterview.title }}
					p(v-if="leadInterview.description" class="text-sm leading-snug text-neutral-200 line-clamp-2 max-w-2xl") {{ leadInterview.description }}
					p(class="text-[10px] uppercase tracking-widest text-neutral-300") By Grugbox · #[NuxtTime(:datetime="leadInterview.date" month="long" day="numeric" year="numeric")]
					NuxtLink(:to="leadInterview.path" class="pointer-events-auto mt-2 inline-block border border-white/80 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white duration-300 hover:bg-white hover:text-black") Read More

			//- Secondary interview card with image on top and details below
			article(v-if="secondInterview" class="group lg:col-span-1 flex flex-col gap-4")
				div(class="photo aspect-16/10 lg:aspect-4/3 bg-gray-200 overflow-hidden")
					NuxtLink(:to="secondInterview.path")
						NuxtImg(:src="secondInterview.image" alt="interview image" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
				div(class="flex flex-col gap-2.5")
					span(v-if="secondInterview.tags?.length" class="text-[11px] font-medium uppercase tracking-wide text-neutral-600 underline underline-offset-4") {{ secondInterview.tags[0] }}
					NuxtLink(:to="secondInterview.path")
						h3(class="text-xl lg:text-2xl tracking-tight duration-300 group-hover:text-brand-accent") {{ secondInterview.title }}
					p(v-if="secondInterview.description" class="text-sm leading-snug text-zinc-600 line-clamp-3") {{ secondInterview.description }}
					p(class="text-[10px] uppercase text-zinc-500") #[NuxtTime(:datetime="secondInterview.date" month="long" day="numeric" year="numeric")]

//- MORE FROM GRUGBOX — archive strip, three more cards per click
section(id="more" class="my-20")
	div(class="container flex flex-col gap-8")
		div(class="flex flex-col gap-2")
			h2(class="text-xs font-bold tracking-wide uppercase") More from Grugbox
			div(class="flex items-center")
				div(class="h-px w-10 shrink-0 bg-black")
				div(class="h-px flex-1 bg-zinc-200")
		div(class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-4")
			article(v-for="post in visibleMore" :key="post.path" class="group")
				div(class="flex flex-col items-center gap-4 text-center mb-4")
					div(class="photo w-full aspect-video bg-gray-200 overflow-hidden")
						NuxtLink(:to="post.path")
							video(v-if="isVideo(post.video || post.image)" :src="post.video || post.image" :poster="!isVideo(post.image) ? post.image : undefined" autoplay loop muted playsinline class="w-full h-full object-cover object-center select-none pointer-events-none")
							NuxtImg(v-else :src="post.image" alt="featured image" class="w-full h-full object-cover object-center select-none pointer-events-none")
					div(class="flex flex-col gap-4")
						span(class="text-[11px] font-medium uppercase tracking-wide text-neutral-600 underline underline-offset-4") {{ post.category }}
						NuxtLink(:to="post.path")
							h3(class="text-xl lg:text-xl tracking-tight duration-300 group-hover:text-brand-accent") {{ post.title }}
						p(class="text-sm leading-snug text-zinc-600 line-clamp-3") {{ post.description }}
						NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" class="text-[10px] uppercase tracking-widest text-zinc-500")
		div(v-if="hasMore" class="flex justify-center")
			button(type="button" class=" bg-black px-10 py-3 text-[11px] font-bold uppercase tracking-widest text-white duration-300" @click="showMore") Show more posts

//- section#newsletter(class="py-12 lg:py-20 bg-black")
	div(class="container")
		div(class="flex flex-wrap items-center")
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 mx-auto flex flex-col gap-4")
					p(class="text-white uppercase text-sm") Subscribe to the
					h2(class="text-5xl lg:text-6xl font-black text-white") GRUGBOX #[br] #[span(class="text-brand-accent") DIGEST]
			div(class="w-full lg:w-1/2 p-4")
				div(class="lg:w-1/2 flex flex-col gap-6")
					p(class="text-white") The most important stories and least important memes, every Friday.
					button(class="bg-brand-accent w-1/2 p-4 text-white uppercase border border-white font-bold") subscribe

//- AD SLOT — centred 728x90 IAB leaderboard
section(id="ad-bottom" aria-label="Advertisement" class="py-8")
	div(class="container flex justify-center")
		//- 728x90 IAB leaderboard with responsive aspect ratio scaling
		div(class="relative w-full max-w-182 aspect-[728/90] overflow-hidden min-w-0")
			video(src="/ads/leaderboard-banner.webm" autoplay loop muted playsinline class="block w-full h-full object-cover object-center select-none pointer-events-none")
</template>