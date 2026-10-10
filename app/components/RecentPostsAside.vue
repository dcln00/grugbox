<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		limit?: number
		count?: number
		title?: string
	}>(),
	{
		limit: 4,
		title: 'Recent Posts',
	}
)

const articleLimit = computed(() => props.count ?? props.limit ?? 4)

const { data: posts } = await useAsyncData(
	() => `recent-posts-${articleLimit.value}`,
	() => {
		return queryCollection('articles')
			.select('title', 'path', 'image', 'video', 'date', 'category', 'tags')
			.order('date', 'DESC')
			.limit(articleLimit.value)
			.all()
	},
	{
		watch: [articleLimit],
	}
)

const primaryTag = (tags?: string[] | null): string => tags?.find(tag => tag !== 'trending') ?? ''
</script>

<template lang="pug">
aside(class="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 self-start")
	div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6 border border-zinc-100")
		div(class="flex flex-col gap-2")
			h2(class="text-xs font-bold tracking-wide uppercase") {{ title }}
			div(class="flex items-center")
				div(class="h-px w-10 shrink-0 bg-black")
				div(class="h-px flex-1 bg-zinc-200")
		div(class="flex flex-col divide-y divide-zinc-200/70")
			article(v-for="item in posts" :key="item.path" class="group flex gap-4 items-start py-5 first:pt-0 last:pb-0")
				div(class="photo size-20 shrink-0 bg-zinc-200 overflow-hidden")
					NuxtLink(:to="item.path")
						video(v-if="isVideo(item.video || item.image)" :src="item.video || item.image" autoplay loop muted playsinline class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
						NuxtImg(v-else :src="item.image" alt="" class="w-full h-full object-cover object-center duration-300 select-none pointer-events-none")
				div(class="flex flex-col gap-1 min-w-0")
					span(class="text-[9px] uppercase font-medium tracking-wide text-neutral-500") {{ item.category || primaryTag(item.tags) }}
					NuxtLink(:to="item.path")
						h3(class="text-sm leading-snug tracking-tight line-clamp-2 duration-300 group-hover:text-brand-accent") {{ item.title }}
					NuxtTime(:datetime="item.date" month="long" day="numeric" year="numeric" class="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5")
</template>
