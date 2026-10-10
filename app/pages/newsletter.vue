<script setup lang="ts">
useHead({
	title: 'Newsletter - Grugbox',
})

useSeoMeta({
	title: 'Newsletter - Grugbox',
	description: 'Subscribe to the Grugbox newsletter for the best album reviews, artist interviews, and African music culture in your inbox.',
	ogTitle: 'The best of Grugbox in your inbox',
	ogDescription: 'Subscribe to the Grugbox newsletter for the best album reviews, artist interviews, and African music culture in your inbox.',
	ogImage: '/content/black-sherif-sun-sherif-cover.jpg',
	twitterTitle: 'The best of Grugbox in your inbox',
	twitterDescription: 'Subscribe to the Grugbox newsletter for the best album reviews, artist interviews, and African music culture in your inbox.',
	twitterImage: '/content/black-sherif-sun-sherif-cover.jpg',
})

const email = ref('')
const name = ref('')
const turnstileRef = ref()
const turnstileToken = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const submittedEmail = ref('')
const errorMessage = ref('')

const editions = [
	{
		id: 'digest',
		title: 'The Grugbox Digest',
		cadence: 'EVERY FRIDAY',
		description: 'A curated weekly dispatch of the most essential stories in African music, culture essays, and weekend listening.',
	},
	{
		id: 'reviews',
		title: 'First Listen & Reviews',
		cadence: 'WEEKLY',
		description: 'Scores, track-by-track verdicts, and deep dives on the latest albums and EPs across Ghana, Nigeria, and the diaspora.',
	},
	{
		id: 'playlists',
		title: 'Playlists & Drops',
		cadence: 'BI-WEEKLY',
		description: 'New Apple Music and Spotify playlist updates featuring Alté, Highlife, Afrobeats, and Amapiano heat.',
	},
]

const selectedEditions = ref<string[]>(['digest', 'reviews', 'playlists'])

async function handleSubscribe() {
	errorMessage.value = ''
	const emailVal = email.value.trim()
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailVal || !emailRegex.test(emailVal)) {
		errorMessage.value = 'Please enter a valid email address.'
		return
	}
	if (selectedEditions.value.length === 0) {
		errorMessage.value = 'Please select at least one newsletter edition.'
		return
	}

	isSubmitting.value = true
	try {
		await $fetch('/api/subscribe', {
			method: 'POST',
			body: {
				email: emailVal,
				name: name.value.trim() || undefined,
				editions: selectedEditions.value,
				source: 'newsletter_page',
				token: turnstileToken.value || undefined,
			},
		})
		submittedEmail.value = emailVal
		isSuccess.value = true
		const subCookie = useCookie<boolean>('grugbox_subscribed', { maxAge: 60 * 60 * 24 * 365 })
		subCookie.value = true
		if (import.meta.client) {
			localStorage.setItem('grugbox_subscribed', 'true')
			localStorage.setItem('grugbox_subscribed_email', emailVal)
		}
	} catch (err: any) {
		turnstileRef.value?.reset()
		errorMessage.value = err?.data?.statusMessage || err?.message || 'Failed to submit. Please try again.'
	} finally {
		isSubmitting.value = false
	}
}

function resetForm() {
	email.value = ''
	name.value = ''
	turnstileToken.value = ''
	turnstileRef.value?.reset()
	errorMessage.value = ''
	isSuccess.value = false
}
</script>

<template lang="pug">
section#newsletter(class="py-10 lg:py-16")
	div(class="container")
		div(class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start")
			//- LEFT COLUMN: Black Sherif EP review image (sticky on desktop)
			aside(class="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 self-start flex flex-col gap-4")
				div(class="photo relative aspect-square sm:aspect-4/3 lg:aspect-square overflow-hidden bg-zinc-950 border border-zinc-200 shadow-xs group")
					NuxtImg(
						src="/content/black-sherif-sun-sherif-cover.jpg"
						alt="Black Sherif – SUN SHERIF"
						class="w-full h-full object-cover object-center duration-700 select-none pointer-events-none"
					)
					div(class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none")
					div(class="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 text-white")
						h2(class="text-lg sm:text-xl font-bold tracking-tight text-white") Black Sherif — SUN SHERIF
						p(class="text-xs text-zinc-300 line-clamp-2") Black Sherif trades grim street narratives for warmth and romance on his six-track EP. Rated 7.5 by Grugbox.
						NuxtLink(
							to="/reviews/ep-review-black-sherif-sun-sherif"
							class="text-[10px] uppercase font-bold tracking-widest text-white hover:text-brand-accent underline underline-offset-6 mt-1 inline-flex items-center gap-1 w-fit duration-200"
						) Read EP Review

			//- RIGHT COLUMN: Headline, subhead, and subscription form
			div(class="lg:col-span-7 xl:col-span-7 flex flex-col gap-8")
				//- Editorial Header matching Pitchfork layout
				div(class="flex flex-col gap-3")
					span(class="text-[10px] font-bold uppercase tracking-widest text-neutral-500") Grugbox Dispatches
					h1(class="text-3xl sm:text-5xl font-medium tracking-tight text-zinc-900 leading-[1.08]") The best of Grugbox in your inbox
					p(class="text-zinc-600 leading-relaxed max-w-2xl") Select the newsletters you would like to receive. Get independent music journalism, unfiltered album verdicts, and exclusive sound profiles delivered weekly.

				//- Success State
				div(v-if="isSuccess" class="border-2 border-black p-8 sm:p-10 bg-zinc-50 flex flex-col items-start gap-5")
					div(class="flex items-center gap-3")
						div(class="size-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm") ✓
						span(class="text-xs font-bold uppercase tracking-widest text-brand-accent") Subscription Confirmed
					h3(class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900") You are on the list.
					p(class="text-sm sm:text-base text-zinc-600 leading-relaxed")
						| We have registered #[strong(class="text-zinc-900") {{ submittedEmail }}] to receive our latest dispatches. Keep an eye out for our upcoming Friday edition.
					div(class="flex flex-wrap items-center gap-4 pt-2")
						NuxtLink(to="/" class="px-6 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-brand-accent duration-200") Return Home
						button(type="button" @click="resetForm" class="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-black underline underline-offset-4 cursor-pointer") Subscribe another email

				//- Subscription Form (Replacing the boxes)
				div(v-else class="border border-black p-6 sm:p-8 bg-white flex flex-col gap-6 shadow-xs")
					div(class="flex flex-col gap-1.5 border-b border-zinc-200 pb-5")
						span(class="text-[10px] uppercase font-bold tracking-widest text-brand-accent") Join Our Readers
						h2(class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900") Subscribe to our newsletter
						p(class="text-xs sm:text-sm text-zinc-600") Choose your preferred editions and enter your details below.

					form(@submit.prevent="handleSubscribe" class="flex flex-col gap-6")
						//- Editions / Newsletters options
						div(class="flex flex-col gap-3")
							div(class="flex items-baseline justify-between")
								span(class="text-[11px] font-bold uppercase tracking-wider text-zinc-900") Newsletter Editions
								span(class="text-[10px] text-zinc-500 uppercase tracking-wider") Choose all that apply
							div(class="flex flex-col divide-y divide-zinc-200 border border-zinc-200")
								label(
									v-for="edition in editions"
									:key="edition.id"
									class="flex items-start gap-4 p-4 cursor-pointer hover:bg-zinc-50 duration-150 select-none"
								)
									input(
										type="checkbox"
										:value="edition.id"
										v-model="selectedEditions"
										class="mt-1 size-4 accent-black rounded-none cursor-pointer shrink-0"
									)
									div(class="flex flex-col gap-1")
										div(class="flex items-center gap-2 flex-wrap")
											span(class="text-sm font-bold text-zinc-900") {{ edition.title }}
											span(class="text-[9px] uppercase font-bold tracking-widest text-neutral-500 bg-zinc-100 px-2 py-0.5") {{ edition.cadence }}
										p(class="text-xs text-zinc-600 leading-normal") {{ edition.description }}

						//- Email Input
						div(class="flex flex-col gap-2")
							label(for="email-input" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
								| Email Address #[span(class="text-brand-accent") *]
							input#email-input(
								v-model="email"
								type="email"
								required
								placeholder="Enter your email address"
								class="w-full border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
							)

						//- First Name Input
						div(class="flex flex-col gap-2")
							label(for="name-input" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
								| First Name #[span(class="text-zinc-400 font-normal text-[10px] tracking-normal") (Optional)]
							input#name-input(
								v-model="name"
								type="text"
								placeholder="Your name"
								class="w-full border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
							)

						//- Cloudflare Turnstile
						div(class="flex justify-start")
							NuxtTurnstile(ref="turnstileRef" v-model="turnstileToken" :options="{ size: 'flexible', theme: 'light', action: 'newsletter_subscribe' }")

						//- Validation error notice
						p(v-if="errorMessage" class="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2")
							| {{ errorMessage }}

						//- Submit Button
						button(
							type="submit"
							:disabled="isSubmitting"
							class="w-full bg-black text-white hover:bg-brand-accent py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer disabled:opacity-50"
						)
							span(v-if="!isSubmitting") Subscribe Now
							span(v-else class="flex items-center justify-center gap-2") Processing Subscription...

						//- Reassurance / Anti-spam note
						p(class="text-[11px] text-zinc-500 leading-relaxed text-center")
							| By subscribing, you agree to receive editorial newsletters from Grugbox. Zero spam, unsubscribe at any time.
</template>
