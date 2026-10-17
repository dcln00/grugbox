<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`legal-${route.params.slug}`, () => {
	return queryCollection('legal').path(`/legal/${route.params.slug}`).first()
})

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useHead({
	title: () => `${page.value?.title || 'Legal'} - Grugbox`,
})

useSeoMeta({
	title: () => `${page.value?.title || 'Legal'} - Grugbox`,
	description: () => page.value?.description || '',
	ogTitle: () => `${page.value?.title || 'Legal'} - Grugbox`,
	ogDescription: () => page.value?.description || '',
	twitterTitle: () => `${page.value?.title || 'Legal'} - Grugbox`,
	twitterDescription: () => page.value?.description || '',
})

const legalPages = [
	{ href: '/user-agreement', name: 'User Agreement' },
	{ href: '/privacy-policy', name: 'Privacy Policy' },
	{ href: '/terms-of-use', name: 'Terms of Use' },
	{ href: '/advertising', name: 'Advertising & Partnerships' },
]

const isCurrent = (path: string): boolean => route.path === path
</script>

<template lang="pug">
article#article(v-if="page")
	//- HEADER SECTION — title, category & byline styled after articles slug page
	header#header(class="pt-10 lg:pt-16 pb-12")
		div(class="container")
			div(class="flex flex-col gap-4 max-w-4xl")
				h1(class="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") {{ page.title }}
				p(class="text-[10px] uppercase tracking-widest text-zinc-500") #[span(v-if="page.lastUpdated") Last Updated {{ page.lastUpdated }}]
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — content on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Prose Content matching articles slug page
				div(class="lg:col-span-8 flex flex-col gap-10")
					div(class="flex-1 min-w-0 flex flex-col gap-8")
						ContentRenderer(
							:value="page"
							class="prose max-w-none prose-p:text-base prose-p:text-zinc-500 prose-p:leading-relaxed hover:prose-a:text-black prose-headings:text-black prose-headings:tracking-tight prose-img:rounded-none prose-img:mx-auto prose-img:block"
						)

				//- RIGHT COLUMN: Restored Previous Sidebar Styles
				aside(class="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-28")
					//- Navigation Directory
					div(class="bg-zinc-50 p-6 flex flex-col gap-6 border border-zinc-100")
						div(class="flex flex-col gap-2")
							h2(class="text-xs font-bold tracking-wide uppercase") Directory
							div(class="flex items-center")
								div(class="h-px w-10 shrink-0 bg-black")
								div(class="h-px flex-1 bg-zinc-200")
						nav(aria-label="Legal Directory" class="flex flex-col gap-1.5")
							NuxtLink(
								v-for="item in legalPages"
								:key="item.href"
								:to="item.href"
								:class="[isCurrent(item.href) ? 'bg-black text-white font-medium' : 'text-zinc-600 hover:text-black hover:bg-zinc-100']"
								class="group text-xs px-3 py-2.5 duration-200 flex items-center justify-between"
							)
								span {{ item.name }}
								svg-chevron-right(
									:class="[isCurrent(item.href) ? 'hidden' : 'text-zinc-400 group-hover:text-black']"
									class="size-3 duration-200"
								)

					//- Help & Inquiries Card
					div(class="border border-black p-6 bg-white flex flex-col gap-3")
						span(class="text-[10px] uppercase font-bold tracking-widest text-brand-accent") Direct Contact
						h3(class="text-base font-bold text-zinc-900") Questions or Inquiries?
						p(class="text-xs text-zinc-600 leading-relaxed")
							| Our editorial and legal staff in Accra are available to assist with syndication requests, privacy queries, and brand partnerships.
						a(
							href="mailto:info@grugbox.world"
							class="mt-2 w-full bg-black text-white hover:bg-brand-accent py-3 text-[11px] font-bold uppercase tracking-widest text-center transition-colors duration-200"
						) Email info@grugbox.world

					//- 336 x 280 Ad Banner
					AdBox(image="/ads/byar-ad2.jpg" url="https://wa.me/message/DRVWF7ABBNUTL1")
</template>
