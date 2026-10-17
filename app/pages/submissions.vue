<script setup lang="ts">
useHead({
	title: 'Submissions - Grugbox',
})

useSeoMeta({
	title: 'Submissions - Grugbox',
	description: 'How to pitch to Grugbox. Editorial pitching guidelines for writers, journalists, and contributors covering Ghana and diaspora culture.',
	ogTitle: 'Submissions - Grugbox',
	ogDescription: 'How to pitch to Grugbox. Editorial pitching guidelines for writers, journalists, and contributors covering Ghana and diaspora culture.',
	twitterTitle: 'Submissions - Grugbox',
	twitterDescription: 'How to pitch to Grugbox. Editorial pitching guidelines for writers, journalists, and contributors covering Ghana and diaspora culture.',
})

</script>

<template lang="pug">
div#submissions-page
	//- HEADER SECTION styled after contact and legal pages
	header#header(class="pt-10 lg:pt-16 pb-12")
		div(class="container")
			div(class="flex flex-col gap-4 max-w-4xl")
				h1(class="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") How to Pitch to Grugbox
				p(class="text-base text-zinc-600 leading-relaxed max-w-2xl")
					| If you're a writer with a story you want to bring us, here's the guide.
			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT — content on left, sidebar on right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Pitch Guide Content
				div(class="lg:col-span-8 flex flex-col gap-10")
					div(class="flex-1 min-w-0 flex flex-col gap-8")
						//- Intro
						div(class="flex flex-col gap-4")
							p(class="font-medium text-zinc-950 leading-relaxed")
								| What makes a good Grugbox pitch? Probably one from a writer who already knows who we are and what we're about, which is why we suggest spending a few minutes reading our recent work before you write to us. The site will tell you faster than this page can whether your pitch fits.
							p(class="text-base text-zinc-600 leading-relaxed")
								| If you've done that and you're back, here's the rundown.

						//- What we publish
						div(class="flex flex-col gap-4 pt-2")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") What We Publish
							p(class="text-base text-zinc-600 leading-relaxed")
								| Grugbox is, before anything else, a Ghana-and-diaspora exclusive editorial publication covering art, culture, and entertainment. We launched with the idea that Ghanaian talent deserves the same global, culturally savvy coverage every other scene gets, and that's what we're here to do. A pitch about a Nigerian designer or a Senegalese musician isn't going to fit no matter how interesting the angle, so please don't send those our way.
							p(class="font-medium text-zinc-950 leading-relaxed")
								| We have five pillars: Sound, Fashion, Screen, Visual, and Society.

						//- Pillars
						div(class="flex flex-col gap-6 pl-2 border-l-2 border-zinc-200")
							div(class="flex flex-col gap-2")
								h3(class="font-medium text-zinc-950 leading-snug") Sound
								p(class="text-base text-zinc-600 leading-relaxed")
									| Sound is exactly what it sounds like (no pun intended). We're music heads, all of us, and our coverage runs the full range from afrobeats to alt R&B, punk to electronic, and anything that doesn't sound like everything else. The artists who make us drop everything are usually the ones doing something experimental: the R&B singer with a punk streak, the alternative rapper everyone will be writing about in six months, or the electronic producer blending different genres. We want studio visits, interviews with artists about to release, music video write-ups, and lists profiling the artists doing something different in Ghana or abroad. (Please don't pitch your friend's first SoundCloud upload. We can tell.)

							div(class="flex flex-col gap-2")
								h3(class="font-medium text-zinc-950 leading-snug") Fashion
								p(class="text-base text-zinc-600 leading-relaxed")
									| Fashion is where the seasonal trend roundup goes to die. We want the costume design on a new diaspora-led series, the manicurist behind the hyper-niche acrylic style everyone's about to copy, or the stylist pulling vintage pieces for a stadium tour. We love a photo essay too, but please don't pitch one expecting us to foot the bill if you're not the photographer.

							div(class="flex flex-col gap-2")
								h3(class="font-medium text-zinc-950 leading-snug") Screen
								p(class="text-base text-zinc-600 leading-relaxed")
									| Screen is film, TV, and 2D or 3D animation. Introduce us to the directors pulling off insane concepts on a micro-budget or taking on highly anticipated studio work, the writers staffing the comedies everyone is currently watching, the animator on a Japanese team for an anime adaptation release, and the breakout actors on the big screen who are stealing every scene they're in. Reviews are accepted, but they're a hard sell. You need a take so good it makes us jealous we didn't think of it first.

							div(class="flex flex-col gap-2")
								h3(class="font-medium text-zinc-950 leading-snug") Visual
								p(class="text-base text-zinc-600 leading-relaxed")
									| Visual is sculptors, set designers, painters, and beyond. A gallery press release isn't going to do it. Pitch us the set designer building physical stages for the biggest pop stars in West Africa or abroad, or the digital artist rendering a dystopian London for a video game.

							div(class="flex flex-col gap-2")
								h3(class="font-medium text-zinc-950 leading-snug") Society
								p(class="text-base text-zinc-600 leading-relaxed")
									| Society is cultural commentary with somewhere to go: pop-culture savvy, take-forward, ideally something we'd argue about over brunch or in a group chat. We want the essay on why afrobeats needs a real lover boy revival, the rise of alté subcultures, what parasocial fan culture looks like when it comes to Ghanaian artists, what the rise of the Christian girlfluencer aesthetic is really selling, or the VIP-fication of Detty December and what that means for the club experience and the social media recap. (If you're writing about December specifically, leave the traffic complaints at home. Everyone has heard them.)

						//- The email
						div(class="flex flex-col gap-4 pt-4")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") The Email
							p(class="text-base text-zinc-600 leading-relaxed")
								| We sift through a lot of emails by title. Your subject line is the only guarantee you have that we'll open it. Please format it exactly like this:
							div(class="bg-zinc-50 border border-zinc-200 p-4 font-mono text-sm text-zinc-900")
								| PITCH: [Your Name] + [Topic] + [Working Headline]
							p(class="text-base text-zinc-600 leading-relaxed")
								| We know it's boring, but it's functional.
							p(class="text-base text-zinc-600 leading-relaxed")
								| Keep the email itself tight. Five to seven sentences is plenty.
							p(class="text-base text-zinc-600 leading-relaxed")
								| Start with a quick intro: where you are, what you do, why this story is the one you want to write. Then give us the pitch in three sentences: what the story is, why you think it's relevant right now, and how you plan to pull it off (including who you've already reached out to). Finish with a working headline, ideally a punchy one-liner, since that's the way we craft our titles.
							p(class="text-base text-zinc-600 leading-relaxed")
								| If we haven't worked together before, link two or three examples of your published work so we can get a sense of your voice.

						//- Pitch Example
						div(class="flex flex-col gap-4 pt-2")
							h3(class="font-medium text-zinc-950 leading-snug") Here's an example of a pitch we'd commission tomorrow:
							div(class="border-l-2 border-brand-accent bg-zinc-50 p-6 flex flex-col gap-4 text-sm text-zinc-700 leading-relaxed")
								p
									| Hi Grugbox team, my name is [Name]. I've been following Grugbox for three months now and finally have a story I want to bring you. I'm based in NYC and I've been a K-pop fan for years. You can find my Substack and Twitter here: [working link attached].
								p
									| I want to pitch a piece on the Accra jewelers whose custom grillz are everywhere from K-pop music videos to Western pop visuals, breaking down why global artists are taking their teeth to Accra instead of the established names in New York or London. Here are some of their recent works: [working link attached]. I did some research beforehand and haven't seen anyone talk about them yet, so I plan to interview [Jeweler Name] on Zoom, and after taking a look at your recent feature pieces, I put together a list of questions for your review. Please find them attached.
								p
									| This is a heavy pop culture piece, and I thought Grugbox's voice would be perfect for it: a "Visual" piece that's slightly obsessive, detail-driven, and culturally savvy.
								p(class="font-medium text-zinc-950")
									| Working title: Pop's grillz plug is in Accra now.
							p(class="text-base text-zinc-600 leading-relaxed")
								| That tells us who you are, what the story is, how you've already started on the access, and gives us a working title to pin it on.

						//- Things worth knowing
						div(class="flex flex-col gap-4 pt-4")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") A few more things worth knowing before you hit send:
							div(class="flex flex-col gap-4")
								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On access.
									p(class="text-base text-zinc-600 leading-relaxed") Don't pitch us an interview just because you want to meet a celebrity and you think we have them on speed dial. The writers who get their dream profile are usually the ones who did the legwork to reach the subject themselves, so come to us with a plan for how you're getting through, or proof you already have.

								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On visuals.
									p(class="text-base text-zinc-600 leading-relaxed") We sponsor the occasional photoshoot, but never without a plan. If you want a visual budget, pitch the photographer and the concept alongside the story, and have a brief or moodboard ready in case we commission. If you're proposing a feature on an artist, exhibition, or book, confirm you already have the press images we'll need to publish.

								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On drafts.
									p(class="text-base text-zinc-600 leading-relaxed") Please don't send us a finished manuscript. Building the piece with you from the start saves us both a brutal editing pass, since rewriting someone else's prose into an already finished draft almost never works. Pre-written articles get filed under "not for us" before anyone opens them.

								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On timing.
									p(class="text-base text-zinc-600 leading-relaxed") This should go without saying, but please don't pitch us something if you're about to disappear for five weeks. Make sure you have the time to write the piece before you send it our way.

								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On personal essays.
									p(class="text-base text-zinc-600 leading-relaxed") We love a great one, but the bar is high. We're a publication, not a blog, and a first-person piece has to do something for the reader, not just for the writer.

								div(class="flex flex-col gap-1")
									p(class="font-medium text-zinc-950 leading-snug") On freshness.
									p(class="text-base text-zinc-600 leading-relaxed") We're looking for things nobody has properly written up yet. If the take already exists as a full piece on another site, leave it for them. A tweet or a TikTok comment doesn't count as a piece, though, so if you want to write about something nobody has gotten to yet, bring it our way.

						//- Rejection
						div(class="flex flex-col gap-4 pt-4")
							h2(class="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Rejection
							p(class="text-base text-zinc-600 leading-relaxed")
								| We know rejection sucks. We've had our fair share of it. But getting a "no" or hearing nothing back isn't personal. Sometimes it just comes down to timing or budget. We try to respond as fast as we can, but please don't chase us after 24 hours unless your pitch is tied to breaking news. Sometimes we just need a minute to clear the inbox. Other times, we hold onto a pitch and circle back weeks later when we have the perfect slate for it.

						//- Closing & CTA
						div(class="flex flex-col gap-3 pt-4")
							p(class="font-medium text-zinc-950 leading-relaxed")
								| That's everything. Good luck out there, and we can't wait to work with you. Send your pitch to:
							a(
								href="mailto:submissions@grugbox.world"
								class="text-sm sm:text-base text-zinc-900 underline underline-offset-4 hover:text-brand-accent duration-200 block w-fit font-medium"
							) submissions@grugbox.world

				//- Right Column: Sidebar Aside
				SidebarAside(:limit="4" ad-url="https://wa.me/message/DRVWF7ABBNUTL1")
</template>
