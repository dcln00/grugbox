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

const contacts = [
	{
		question: 'If you have questions about your subscription or need assistance, our Customer Care team is here to help.',
		email: 'help@grugbox.world',
		href: 'mailto:help@grugbox.world',
	},
	{
		question: 'Where do I report technical errors on the site (images won’t load, broken links, etc.)?',
		email: 'corrections@grugbox.world',
		href: 'mailto:corrections@grugbox.world',
	},
	{
		question: 'Where do I report editorial errors on the site?',
		email: 'corrections@grugbox.world',
		href: 'mailto:corrections@grugbox.world',
	},
	{
		question: 'How do I get in touch with the Grugbox news department?',
		email: 'news@grugbox.world',
		href: 'mailto:news@grugbox.world',
	},
	{
		question: 'Where should I send a press release?',
		email: 'news@grugbox.world',
		href: 'mailto:news@grugbox.world',
	},
	{
		question: 'Whom should I contact regarding press inquiries?',
		email: 'press@grugbox.world',
		href: 'mailto:press@grugbox.world',
	},
	{
		question: 'Whom should I contact in regards to business development ideas and opportunities?',
		email: 'ads@grugbox.world',
		href: 'mailto:ads@grugbox.world',
	},
	{
		question: 'Where should I submit music, demos, or artist releases for editorial review consideration?',
		email: 'submissions@grugbox.world',
		href: 'mailto:submissions@grugbox.world',
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
				//- LEFT COLUMN: Contact Q&A Entries
				div(class="lg:col-span-8 flex flex-col gap-10")
					div(class="flex-1 min-w-0 flex flex-col gap-8")
						//- Policy note
						div(class="pb-2")
							p(class="font-medium text-zinc-950 leading-relaxed")
								| Answers to many common questions can be found in our #[NuxtLink(to="/user-agreement" class="underline underline-offset-4 hover:text-brand-accent duration-200") User Agreement].

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

				//- Right Column: Recent Posts Aside
				RecentPostsAside(:limit="4")
</template>
