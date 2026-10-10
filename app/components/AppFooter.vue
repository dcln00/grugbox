<script setup lang="ts">
import type { Component } from 'vue'
import SvgSocialsInstagram from '~/components/svg/socials/instagram.vue'
import SvgSocialsX from '~/components/svg/socials/x.vue'
import SvgSocialsTikTok from '~/components/svg/socials/tiktok.vue'

interface SocialLink {
	name: string
	href: string
	icon: Component
}

const SOCIAL_LINKS: SocialLink[] = [
	{ name: 'Instagram', href: '#', icon: SvgSocialsInstagram },
	{ name: 'X', href: '#', icon: SvgSocialsX },
	{ name: 'TikTok', href: '#', icon: SvgSocialsTikTok },
]
</script>

<template lang="pug">
footer(class="bg-zinc-900 text-neutral-300")
	div(class="container py-14 lg:py-12")
		div(class="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-16")
			//- Brand, tagline and socials
			div(class="flex flex-col gap-6 lg:col-span-2")
				NuxtLink(to="/" aria-label="Grugbox" class="w-fit")
					svg-logo(class="h-6 w-auto text-white" aria-hidden="true")
				p(class="max-w-xs text-sm leading-relaxed") Creative hub of music, culture, lifestyle + more.
				ul(class="flex items-center gap-6")
					li(v-for="social in SOCIAL_LINKS" :key="social.name")
						a(:href="social.href" :aria-label="social.name" class="block text-neutral-400 duration-300 hover:text-white")
							component(:is="social.icon" class="size-5")

			//- Mobile Accordion (strictly mobile)
			AppFooterAccordion(:sections="FOOTER_SECTIONS" class="lg:hidden")

			//- Desktop Link columns (strictly desktop)
			div(v-for="section in FOOTER_SECTIONS" :key="section.title" class="hidden lg:flex flex-col gap-4")
				h6(class="text-neutral-400 tracking-wide uppercase font-bold text-[11px]") {{ section.title }}
				ul(class="flex flex-col gap-px")
					li(v-for="link in section.links" :key="link.name")
						NuxtLink(:to="link.href" :target="link.target" :external="link.external" class="text-xs uppercase tracking-wide duration-300 hover:underline") {{ link.name }}

		hr(class="mt-2 mb-10 lg:my-12 border-neutral-700")
		//- Legal row
		div(class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between")
			ul(class="flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] font-bold uppercase tracking-wide")
				template(v-for="(link, idx) in LEGAL_LINKS" :key="link.name")
					li(v-if="idx > 0" aria-hidden="true" class="text-neutral-600") |
					li
						NuxtLink(:to="link.href" :target="link.target" :external="link.external" class="text-neutral-400 duration-300 hover:text-white") {{ link.name }}
		p(class="mt-6 max-w-3xl text-xs leading-relaxed text-neutral-500") © {{ new Date().getFullYear() }} Grugbox. All rights reserved. The material on this site may not be reproduced, distributed, transmitted, cached or otherwise used, except with the prior written permission of Grugbox. Powered by #[NuxtLink(to="https://byar.online" class="text-neutral-500 duration-300 hover:text-white") Byar].
</template>
