<script setup lang="ts">
const route = useRoute()

useHead({
	title: 'Playlists - Grugbox',
})

useSeoMeta({
	description: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	ogDescription: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	twitterDescription: 'Curated playlists featuring the best of Ghanaian music and beyond.',
	ogImage: OG_FALLBACK_IMAGE,
	twitterImage: OG_FALLBACK_IMAGE,
})

const { data: playlists } = await useAsyncData('playlists', () => {
  return queryCollection('playlists')
	.select('title', 'description', 'path', 'image', 'date', 'tags')
	.order('date', 'DESC')
	.all()
})

const primaryTag = (tags?: string[] | null): string => tags?.find(tag => tag !== 'trending') ?? ''

const selectedTag = computed(() => {
  const tag = route.query.tag
  return (Array.isArray(tag) ? tag[0] : tag) || ''
})

const filteredPlaylists = computed(() => {
  const list = playlists.value ?? []
  if (!selectedTag.value) return list
  return list.filter(item => item.tags?.includes(selectedTag.value))
})

const PAGE_SIZE = 12

const totalPlaylists = computed(() => filteredPlaylists.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalPlaylists.value / PAGE_SIZE)))

const currentPage = computed(() => {
  const pageParam = route.query.page
  if (!pageParam) return 1
  const parsed = parseInt(Array.isArray(pageParam) ? pageParam[0] ?? '1' : pageParam, 10)
  if (isNaN(parsed) || parsed < 1) return 1
  if (totalPages.value > 0 && parsed > totalPages.value) return totalPages.value
  return parsed
})

const paginatedPlaylists = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPlaylists.value.slice(start, start + PAGE_SIZE)
})

const paginationRange = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

function getPageUrl(page: number | string) {
  const p = typeof page === 'string' ? parseInt(page, 10) : page
  const query: Record<string, string> = {}
  if (selectedTag.value) {
    query.tag = selectedTag.value
  }
  if (p > 1) {
    query.page = String(p)
  }
  return {
    path: '/playlists',
    query,
  }
}

if (import.meta.client) {
  watch(currentPage, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
</script>

<template lang="pug">
section#playlists(class="py-10 lg:py-16")
	div(class="container flex flex-col gap-10")
		//- Header bar styled like section#more
		div(class="flex flex-col gap-2")
			div(class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4")
				h2(class="text-xs font-bold tracking-wide uppercase shrink-0") {{ selectedTag ? `Playlists tagged #${selectedTag}` : 'All Playlists' }}
				p(v-if="!selectedTag" class="text-xs text-zinc-500 sm:text-right") Curated collections of the best sounds from Ghana and beyond.
				NuxtLink(v-if="selectedTag" to="/playlists" class="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black underline underline-offset-4 shrink-0") Clear filter
			div(class="flex items-center")
				div(class="h-px w-10 shrink-0 bg-black")
				div(class="h-px flex-1 bg-zinc-200")

		div(v-if="paginatedPlaylists.length" class="flex flex-col gap-16")
			//- Article Grid matching section#more
			div(class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8")
				article(v-for="post in paginatedPlaylists" :key="post.path" class="group")
					div(class="flex flex-col items-center gap-4 text-center mb-4")
						div(class="photo w-full aspect-video bg-gray-200 overflow-hidden")
							NuxtLink(:to="post.path")
								NuxtImg(:src="post.image" alt="featured image" class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none")
						div(class="flex flex-col gap-4")
							span(v-if="primaryTag(post.tags)" class="text-[11px] font-medium uppercase tracking-wide text-neutral-600 underline underline-offset-4") {{ primaryTag(post.tags) }}
							NuxtLink(:to="post.path")
								h3(class="text-xl lg:text-xl tracking-tight duration-300 group-hover:text-brand-accent") {{ post.title }}
							p(v-if="post.description" class="text-sm leading-snug text-zinc-600 line-clamp-2") {{ post.description }}
							NuxtTime(:datetime="post.date" month="long" day="numeric" year="numeric" class="text-[10px] uppercase tracking-widest text-zinc-500")

			//- Pagination controls replacing show more button
			nav(v-if="totalPages > 1" aria-label="Playlists pagination" class="flex flex-wrap items-center justify-center gap-2 pt-12 border-t border-zinc-200")
				//- Previous Button
				NuxtLink(v-if="currentPage > 1" :to="getPageUrl(currentPage - 1)" aria-label="Previous page" class="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 text-[11px] font-bold uppercase tracking-widest text-zinc-700 hover:bg-black hover:text-white hover:border-black duration-200") Prev
				span(v-else aria-disabled="true" class="flex items-center gap-1.5 px-4 py-2 border border-zinc-100 text-[11px] font-bold uppercase tracking-widest text-zinc-300 cursor-not-allowed select-none") Prev

				//- Page Numbers
				template(v-for="(pageItem, idx) in paginationRange" :key="idx")
					span(v-if="pageItem === '...'" class="size-10 flex items-center justify-center text-zinc-400 text-xs tracking-widest select-none") ...
					span(v-else-if="pageItem === currentPage" aria-current="page" class="size-10 flex items-center justify-center bg-black text-white text-xs font-bold border border-black") {{ pageItem }}
					NuxtLink(v-else :to="getPageUrl(pageItem)" :aria-label="`Go to page ${pageItem}`" class="size-10 flex items-center justify-center border border-zinc-200 text-zinc-700 hover:bg-black hover:text-white hover:border-black text-xs font-medium duration-200") {{ pageItem }}

				//- Next Button
				NuxtLink(v-if="currentPage < totalPages" :to="getPageUrl(currentPage + 1)" aria-label="Next page" class="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 text-[11px] font-bold uppercase tracking-widest text-zinc-700 hover:bg-black hover:text-white hover:border-black duration-200") Next
				span(v-else aria-disabled="true" class="flex items-center gap-1.5 px-4 py-2 border border-zinc-100 text-[11px] font-bold uppercase tracking-widest text-zinc-300 cursor-not-allowed select-none") Next

		//- Empty State
		div(v-else class="text-center py-20 flex flex-col items-center gap-4")
			p(class="text-zinc-500 text-lg") No playlists found. Check back soon!
			NuxtLink(v-if="selectedTag" to="/playlists" class="text-xs uppercase tracking-widest font-bold underline underline-offset-4 text-black hover:text-brand-accent") View all playlists
</template>
