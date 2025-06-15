<script setup lang="ts">
const nav = [
	{
		href: '/about',
		name: 'About',
	},
	{
		href: '/contact',
		name: 'Contact',
	},
]
</script>

<template lang="pug">
footer(class="pt-24 pb-16")
	.container(class="flex flex-col gap-14")
		ul(class="flex justify-center gap-4 *:cursor-pointer")
			li(v-for="(link, idx) in nav" :key="idx" class="hover:text-brand-accent text-xs font-bold lowercase underline tracking-tight") #[NuxtLink(:to="link.href" activeClass='active-link') {{ link.name }}]
		hr(class="w-24 mx-auto text-zinc-300")
		p(class="text-center uppercase text-xs") © copyright {{ new Date().getFullYear() }} #[NuxtLink(to="/" class="font-bold underline") Grugbox]
</template>