<script setup lang="ts">
useHead({
	title: 'Contact - Grugbox',
})

useSeoMeta({
	title: 'Contact - Grugbox',
	description: 'Get in touch with Grugbox. Contact information for customer care, editorial, news, technical corrections, advertising, and music submissions.',
	ogTitle: 'Contact Grugbox',
	ogDescription: 'Contact information for customer care, editorial, news, technical corrections, advertising, and music submissions.',
	twitterTitle: 'Contact Grugbox',
	twitterDescription: 'Contact information for customer care, editorial, news, technical corrections, advertising, and music submissions.',
})

const { data: popularPosts } = await useAsyncData('contact-popular-articles', () => {
	return queryCollection('articles')
		.select('title', 'path', 'image', 'video', 'date', 'category', 'tags')
		.order('date', 'DESC')
		.limit(4)
		.all()
})

const primaryTag = (tags?: string[] | null): string => tags?.find(tag => tag !== 'trending') ?? ''

const contacts = [
	{
		question: 'If you have questions about your subscription or need assistance, our Customer Care team is here to help.',
		email: 'help@grugbox.com',
		href: 'mailto:help@grugbox.com',
	},
	{
		question: 'Where do I report technical errors on the site (images won’t load, broken links, etc.)?',
		email: 'corrections@grugbox.com',
		href: 'mailto:corrections@grugbox.com',
	},
	{
		question: 'Where do I report editorial errors on the site?',
		email: 'corrections@grugbox.com',
		href: 'mailto:corrections@grugbox.com',
	},
	{
		question: 'How do I get in touch with the Grugbox news department?',
		email: 'news@grugbox.com',
		href: 'mailto:news@grugbox.com',
	},
	{
		question: 'Where should I send a press release?',
		email: 'news@grugbox.com',
		href: 'mailto:news@grugbox.com',
	},
	{
		question: 'Whom should I contact regarding press inquiries?',
		email: 'press@grugbox.com',
		href: 'mailto:press@grugbox.com',
	},
	{
		question: 'Whom should I contact in regards to business development ideas and opportunities?',
		email: 'ads@grugbox.com',
		href: 'mailto:ads@grugbox.com',
	},
	{
		question: 'Where should I submit music, demos, or artist releases for editorial review consideration?',
		email: 'submissions@grugbox.com',
		href: 'mailto:submissions@grugbox.com',
	},
]
</script>

<template lang="pug">
div#contact-page
	//- HEADER SECTION styled after legal and articles slug pages
	header#header(class="pt-10 lg:pt-16 pb-12")
		div(class="container")
			div(class="flex flex-col gap-4 max-w-4xl")
				h1(class="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") Contact Grugbox
				p(class="text-base text-zinc-600 leading-relaxed max-w-2xl")
					| Reach out to our editorial, technical, and commercial departments in Accra. Find the appropriate direct contact below.
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — content on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: FAQ & Contact Q&A Entries
				div(class="lg:col-span-8 flex flex-col gap-10")
					div(class="flex-1 min-w-0 flex flex-col gap-8")
						//- FAQ note from the top of the reference
						div(class="pb-2")
							p(class="font-medium text-zinc-950 leading-relaxed")
								| Answers to many common questions can be found in our #[NuxtLink(to="/about" class="underline underline-offset-4 hover:text-brand-accent duration-200") FAQ] or #[NuxtLink(to="/user-agreement" class="underline underline-offset-4 hover:text-brand-accent duration-200") User Agreement].

						//- Question / Email entries matching reference format
						div(v-for="(item, idx) in contacts" :key="idx" class="flex flex-col gap-2")
							p(class="font-medium text-zinc-950 leading-snug")
								| {{ item.question }}
							div(class="flex flex-wrap items-center gap-x-4 gap-y-1")
								a(
									:href="item.href"
									class="text-sm sm:text-base text-zinc-900 underline underline-offset-4 hover:text-brand-accent duration-200 block w-fit"
								) {{ item.email }}
								NuxtLink(
									v-if="item.linkHref"
									:to="item.linkHref"
									class="text-xs uppercase font-bold tracking-wider text-brand-accent hover:text-black underline underline-offset-4 duration-200"
								) {{ item.linkText }}

				//- Right Column: Popular Posts + 336x280 Ad Banner
				aside(class="lg:col-span-4 flex flex-col gap-10 lg:sticky lg:top-24 self-start")
					//- Popular Posts Box
					div(class="bg-zinc-50 p-6 lg:p-8 flex flex-col gap-6 border border-zinc-100")
						div(class="flex flex-col gap-2")
							h2(class="text-xs font-bold tracking-wide uppercase") Recent Posts
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
</template>
