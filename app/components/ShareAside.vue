<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		url?: string
		shareUrl?: string
		title?: string
		label?: string
	}>(),
	{
		url: '',
		shareUrl: '',
		title: '',
		label: 'Share',
	}
)

const resolvedUrl = computed(() => props.url || props.shareUrl || '')

const { copy, copied } = useClipboard({ legacy: true })
</script>

<template lang="pug">
aside(:aria-label="label" class="flex md:flex-col border border-zinc-200 bg-white md:sticky md:top-28 shrink-0 divide-x md:divide-x-0 md:divide-y divide-zinc-200 z-0")
	a(:href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
		svg-socials-facebook(class="size-4")
	a(:href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(resolvedUrl)}&text=${encodeURIComponent(title)}`" target="_blank" rel="noopener noreferrer" aria-label="Share on X" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200")
		svg-socials-x(class="size-4")
	button(type="button" @click="copy(resolvedUrl)" :aria-label="copied ? 'Link copied' : 'Copy link'" :title="copied ? 'Link copied' : 'Copy link'" class="size-14 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-50 duration-200 cursor-pointer relative")
		svg-link(class="size-4 transition-colors" :class="{ 'text-emerald-600': copied }")
		span(v-if="copied" class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 md:bottom-auto md:mb-0 md:left-full md:ml-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 pointer-events-none whitespace-nowrap shadow-sm z-10") Copied!
</template>
