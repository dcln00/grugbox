<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		image?: string
		url?: string
		href?: string
		alt?: string
		label?: string
	}>(),
	{
		image: '/ads/byar-ad2.jpg',
		url: '',
		href: '',
		alt: '',
		label: '336 x 280 AD',
	}
)

const targetUrl = computed(() => props.url || props.href || '')
const isExternal = computed(() => {
	if (!targetUrl.value) return false
	return /^https?:\/\//i.test(targetUrl.value) || targetUrl.value.startsWith('//')
})
const resolvedAlt = computed(() => props.alt || props.label || 'Advertisement')
</script>

<template lang="pug">
div(class="flex justify-center")
	//- 336 x 280 container (h-70 = 280px, max-w-84 = 336px)
	NuxtLink(
		v-if="targetUrl"
		:to="targetUrl"
		:target="isExternal ? '_blank' : undefined"
		:rel="isExternal ? 'noopener noreferrer' : undefined"
		class="group relative flex h-70 w-full max-w-84 items-center justify-center overflow-hidden bg-zinc-200 text-zinc-500 border border-zinc-300/50"
	)
		video(
			v-if="isVideo(image)"
			:src="image"
			autoplay
			loop
			muted
			playsinline
			class="w-full h-full object-cover object-center select-none pointer-events-none"
		)
		NuxtImg(
			v-else-if="image"
			:src="image"
			:alt="resolvedAlt"
			width="336"
			height="280"
			class="w-full h-full object-cover object-center duration-300 select-none group-hover:opacity-95"
		)
		span(
			v-else
			class="text-[10px] uppercase tracking-widest font-medium duration-200 group-hover:text-black select-none"
		) {{ label }}

	div(
		v-else
		class="relative flex h-70 w-full max-w-84 items-center justify-center overflow-hidden bg-zinc-200 text-zinc-500 border border-zinc-300/50"
	)
		video(
			v-if="isVideo(image)"
			:src="image"
			autoplay
			loop
			muted
			playsinline
			class="w-full h-full object-cover object-center select-none pointer-events-none"
		)
		NuxtImg(
			v-else-if="image"
			:src="image"
			:alt="resolvedAlt"
			width="336"
			height="280"
			class="w-full h-full object-cover object-center select-none"
		)
		span(
			v-else
			class="text-[10px] uppercase tracking-widest font-medium select-none"
		) {{ label }}
</template>
