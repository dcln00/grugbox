<script setup lang="ts">
useHead({
	title: 'Volunteer - Grugbox',
})

useSeoMeta({
	title: 'Volunteer - Grugbox',
	description: 'Volunteer with Grugbox. Explore open contributor positions for writers and photographers covering music, culture, and art in Ghana and the diaspora.',
	ogTitle: 'Volunteer - Grugbox',
	ogDescription: 'Volunteer with Grugbox. Explore open contributor positions for writers and photographers covering music, culture, and art in Ghana and the diaspora.',
	twitterTitle: 'Volunteer - Grugbox',
	twitterDescription: 'Volunteer with Grugbox. Explore open contributor positions for writers and photographers covering music, culture, and art in Ghana and the diaspora.',
})

</script>

<template lang="pug">
div#volunteer-page
	//- HEADER SECTION styled after contact and legal pages
	header#header(class="pt-10 lg:pt-16 pb-12")
		div(class="container")
			div(class="flex flex-col gap-4 max-w-4xl")
				h1(class="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") Volunteer with us
				p(class="text-base text-zinc-600 leading-relaxed max-w-2xl")
					| Join the team shaping culture, sound, and visual storytelling across Ghana and the diaspora. Explore open volunteer roles below.
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — content on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Volunteer Listings
				div(class="lg:col-span-8 flex flex-col gap-10")
					div(class="flex-1 min-w-0 flex flex-col gap-8")
						//- Intro
						div(class="flex flex-col gap-4")
							p(class="font-medium text-zinc-950 leading-relaxed")
								| We're constantly on the lookout for dedicated contributors eager to build their portfolio, develop their voice, and collaborate with an editorial team spotlighting creative talent across Accra and the global diaspora.

						//- Open Listings
						div(class="flex flex-col gap-6 pt-2")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Open Roles

							div(
								v-for="role in VOLUNTEER_ROLES"
								:key="role.slug"
								class="border border-zinc-200 p-6 lg:p-8 bg-zinc-50 flex flex-col gap-4"
							)
								div(class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/80")
									div(class="flex flex-col gap-1")
										h3(class="text-xl font-medium text-zinc-950 leading-snug") {{ role.title }}
										span(class="text-[10px] uppercase font-bold tracking-wider text-neutral-500") {{ role.badge }}
									NuxtLink(
										:to="`/volunteer/${role.slug}`"
										class="text-xs uppercase font-bold tracking-wider text-brand-accent hover:text-black underline underline-offset-4 duration-200 shrink-0"
									) Apply
								p(class="text-base text-zinc-600 leading-relaxed") {{ role.shortDescription }}

						//- What We Offer
						div(class="flex flex-col gap-4 pt-4")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") What You'll Gain
							p(class="text-base text-zinc-600 leading-relaxed")
								| Volunteers work directly alongside our editorial staff, receiving hands-on editing, published bylines and credits on Grugbox, press credentials for events, and a recognized platform to amplify your creative voice.

						//- Questions Note
						div(class="flex flex-col gap-2 pt-2")
							p(class="font-medium text-zinc-950 leading-snug") Questions about volunteering?
							p(class="text-base text-zinc-600 leading-relaxed")
								| If you have any inquiries regarding volunteer commitments or want to pitch a specialized role, reach out directly:
							a(
								href="mailto:careers@grugbox.world"
								class="text-sm sm:text-base text-zinc-900 underline underline-offset-4 hover:text-brand-accent duration-200 block w-fit font-medium"
							) careers@grugbox.world

				//- Right Column: Sidebar Aside
				SidebarAside(:limit="4" ad-url="https://wa.me/message/DRVWF7ABBNUTL1")
</template>
