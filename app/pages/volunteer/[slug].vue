<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const role = computed(() => getVolunteerRole(slug.value))

if (!role.value) {
	throw createError({ statusCode: 404, statusMessage: 'Role not found', fatal: true })
}

useHead({
	title: () => `${role.value?.title || 'Volunteer'} - Grugbox`,
})

useSeoMeta({
	title: () => `${role.value?.title || 'Volunteer'} - Grugbox`,
	description: () => role.value?.shortDescription || '',
	ogTitle: () => `${role.value?.title || 'Volunteer'} - Grugbox`,
	ogDescription: () => role.value?.shortDescription || '',
	twitterTitle: () => `${role.value?.title || 'Volunteer'} - Grugbox`,
	twitterDescription: () => role.value?.shortDescription || '',
})

// Form State
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const linkedinUrl = ref('')
const portfolioUrl = ref('')
const socialHandle = ref('')
const areaOfInterest = ref('Music')
const location = ref('')
const storyPitch = ref('')
const visualConcept = ref('')
const followedWriters = ref('')
const turnstileRef = ref()
const turnstileToken = ref('')

const interestOptions = [
	'Fashion',
	'Film & TV',
	'Music',
	'Visual Art',
	'Society & Culture',
]

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

function handleSubmit() {
	errorMessage.value = ''

	if (!firstName.value.trim() || !lastName.value.trim()) {
		errorMessage.value = 'Please enter both first and last names.'
		return
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
		errorMessage.value = 'Please enter a valid email address.'
		return
	}

	if (!portfolioUrl.value.trim()) {
		errorMessage.value = 'Please provide a link to your portfolio or published work.'
		return
	}

	if (!areaOfInterest.value) {
		errorMessage.value = 'Please choose your primary area of interest.'
		return
	}

	if (!location.value.trim()) {
		errorMessage.value = 'Please let us know where you are currently based.'
		return
	}

	if (!storyPitch.value.trim()) {
		errorMessage.value = 'Please share the story headline and angle you would pitch.'
		return
	}

	isSubmitting.value = true

	try {
		if (turnstileToken.value) {
			const res: any = await $fetch('/_turnstile/validate', {
				method: 'POST',
				body: { token: turnstileToken.value },
			})
			if (res && res.success === false) {
				throw new Error('Turnstile verification failed. Please try again.')
			}
		}
		isSubmitted.value = true
	} catch (err: any) {
		turnstileRef.value?.reset()
		errorMessage.value = err?.data?.statusMessage || err?.message || 'Verification failed. Please try again.'
	} finally {
		isSubmitting.value = false
	}
}

function resetForm() {
	firstName.value = ''
	lastName.value = ''
	email.value = ''
	linkedinUrl.value = ''
	portfolioUrl.value = ''
	socialHandle.value = ''
	areaOfInterest.value = 'Music'
	location.value = ''
	storyPitch.value = ''
	visualConcept.value = ''
	followedWriters.value = ''
	turnstileToken.value = ''
	turnstileRef.value?.reset()
	isSubmitted.value = false
	errorMessage.value = ''
}
</script>

<template lang="pug">
div#volunteer-role-page(v-if="role")
	//- HEADER SECTION: Role Title, Metadata badges & View all jobs link
	header#header(class="pt-10 lg:pt-16 pb-8")
		div(class="container")
			div(class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6")
				div(class="flex flex-col gap-3")
					h1(class="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight") {{ role.title }}
					p(class="text-sm text-zinc-600") {{ role.location }}

				//- View all roles link
				NuxtLink(
					to="/volunteer"
					class="text-xs uppercase font-bold tracking-wider text-zinc-600 hover:text-black flex items-center gap-1.5 duration-200 self-start sm:self-end shrink-0"
				)
					span(aria-hidden="true") ‹
					span View all roles

			div(class="h-px w-full bg-zinc-200 mt-8")

	//- MAIN TWO-COLUMN LAYOUT: Role Details on Left, Application Form Card on Right
	section#content(class="pb-20")
		div(class="container")
			div(class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start")
				//- LEFT COLUMN: Role Details
				div(class="lg:col-span-7 flex flex-col gap-10")
					//- About The Role
					div(class="flex flex-col gap-4")
						h2(class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") About The Role
						p(class="text-base text-zinc-600 leading-relaxed") {{ role.about }}

					//- Responsibilities
					div(class="flex flex-col gap-4")
						h2(class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Responsibilities
						ul(class="flex flex-col gap-3 list-disc pl-5 text-base text-zinc-600 leading-relaxed marker:text-zinc-400")
							li(v-for="(item, i) in role.responsibilities" :key="i") {{ item }}

					//- Requirements
					div(class="flex flex-col gap-4")
						h2(class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Requirements
						ul(class="flex flex-col gap-3 list-disc pl-5 text-base text-zinc-600 leading-relaxed marker:text-zinc-400")
							li(v-for="(item, i) in role.requirements" :key="i") {{ item }}

					//- Compensation & Funding
					div(class="flex flex-col gap-4")
						h2(class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Compensation & Funding
						p(class="text-base text-zinc-600 leading-relaxed") {{ role.compensation.intro }}
						ul(class="flex flex-col gap-3 list-disc pl-5 text-base text-zinc-600 leading-relaxed marker:text-zinc-400")
							li(v-for="(item, i) in role.compensation.items" :key="i")
								strong(class="font-semibold text-zinc-950") {{ item.label }}:
								span(class="ml-1.5") {{ item.detail }}

					//- Diversity & Inclusion
					div(class="flex flex-col gap-4")
						h2(class="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900 leading-snug") Diversity & Inclusion
						p(class="text-base text-zinc-600 leading-relaxed") {{ role.diversity }}

				//- RIGHT COLUMN: Application Card
				aside(class="lg:col-span-5 lg:sticky lg:top-24 self-start")
					div(class="border border-zinc-200 p-6 sm:p-8 bg-white shadow-xs flex flex-col gap-6")
						//- Form Header
						div(class="flex flex-col gap-1 border-b border-zinc-100 pb-4")
							h3(class="text-2xl font-medium tracking-tight text-zinc-900") Apply
							p(class="text-xs text-zinc-500") Complete the form below to apply for the {{ role.title }} role.

						//- Success State
						div(v-if="isSubmitted" class="border border-black p-6 bg-zinc-50 flex flex-col gap-4")
							div(class="flex items-center gap-3")
								div(class="size-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs") ✓
								span(class="text-xs font-bold uppercase tracking-widest text-brand-accent") Application Received
							h4(class="text-lg font-medium text-zinc-900") Thanks for applying, {{ firstName }}!
							p(class="text-sm text-zinc-600 leading-relaxed")
								| We have recorded your application for the #[strong(class="text-zinc-900") {{ role.title }}] position. Our editorial team will review your portfolio and reach out via #[strong(class="text-zinc-900") {{ email }}].
							p(class="text-xs text-zinc-500 leading-relaxed")
								| You can also send additional work or portfolio PDFs directly to #[a(href="mailto:careers@grugbox.world" class="underline hover:text-black") careers@grugbox.world].
							button(
								type="button"
								@click="resetForm"
								class="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-black underline underline-offset-4 cursor-pointer w-fit"
							) Submit another response

						//- Application Form
						form(v-else @submit.prevent="handleSubmit" class="flex flex-col gap-5")
							//- First Name & Last Name (2 columns)
							div(class="grid grid-cols-1 sm:grid-cols-2 gap-4")
								div(class="flex flex-col gap-1.5")
									label(for="first-name" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
										| First Name #[span(class="text-brand-accent") *]
									input#first-name(
										v-model="firstName"
										type="text"
										required
										placeholder="First name"
										class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
									)

								div(class="flex flex-col gap-1.5")
									label(for="last-name" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
										| Last Name #[span(class="text-brand-accent") *]
									input#last-name(
										v-model="lastName"
										type="text"
										required
										placeholder="Last name"
										class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
									)

							//- Email
							div(class="flex flex-col gap-1.5")
								label(for="email" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
									| Email #[span(class="text-brand-accent") *]
								input#email(
									v-model="email"
									type="email"
									required
									placeholder="your.email@example.com"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- LinkedIn Profile URL
							div(class="flex flex-col gap-1.5")
								label(for="linkedin" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
									| LinkedIn Profile URL
								input#linkedin(
									v-model="linkedinUrl"
									type="url"
									placeholder="https://linkedin.com/in/username"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- Portfolio / Work Link
							div(class="flex flex-col gap-1.5")
								label(for="portfolio" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
									| Portfolio / Work Link #[span(class="text-brand-accent") *]
								input#portfolio(
									v-model="portfolioUrl"
									type="url"
									required
									placeholder="https://yourportfolio.com or drive link"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- Instagram / Social Handle
							div(class="flex flex-col gap-1.5")
								label(for="social" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
									| Instagram / Social Handle
								input#social(
									v-model="socialHandle"
									type="text"
									placeholder="@username"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- Primary Area of Interest (Radio list)
							div(class="flex flex-col gap-2.5 pt-1")
								span(class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
									| What is your primary area of interest? #[span(class="text-brand-accent") *]
								div(class="flex flex-col gap-2.5")
									label(
										v-for="opt in interestOptions"
										:key="opt"
										class="flex items-center gap-3 cursor-pointer select-none group"
									)
										input(
											type="radio"
											name="areaOfInterest"
											:value="opt"
											v-model="areaOfInterest"
											class="size-4 accent-black cursor-pointer shrink-0"
										)
										span(class="text-sm text-zinc-800 group-hover:text-black") {{ opt }}

							//- Where are you currently based?
							div(class="flex flex-col gap-1.5")
								label(for="location" class="text-xs font-semibold text-zinc-900 leading-snug")
									| Where are you currently based? #[span(class="text-brand-accent") *]
								input#location(
									v-model="location"
									type="text"
									required
									placeholder="e.g. Accra, London, New York"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- Story Pitch
							div(class="flex flex-col gap-1.5")
								label(for="story-pitch" class="text-xs font-semibold text-zinc-900 leading-snug")
									| If you were commissioned to write for Grugbox next week, what story would you break? Give us the Headline and a 2-sentence summary of the angle. (We are looking for a "Who, What, and Why now"—do not pitch general themes like "Ghanaian Fashion." or subjects unrelated to Ghana.) #[span(class="text-brand-accent") *]
								textarea#story-pitch(
									v-model="storyPitch"
									required
									rows="3"
									placeholder="Headline and 2-sentence summary..."
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors resize-y"
								)

							//- Visual Essay Concept (Optional)
							div(class="flex flex-col gap-1.5")
								label(for="visual-concept" class="text-xs font-semibold text-zinc-900 leading-snug")
									| ONLY if you are pitching a visual essay (photographs only with no written component) or submitting a completed one, please outline your concept here. Include your subject matter, visual direction, the story you want to tell, and why it matters. (Note that if you are pitching a visual essay, you must be able to photograph the subjects yourself.)
								textarea#visual-concept(
									v-model="visualConcept"
									rows="3"
									placeholder="Outline your visual concept..."
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors resize-y"
								)

							//- Followed Writers & Publications (Optional)
							div(class="flex flex-col gap-1.5")
								label(for="followed-writers" class="text-xs font-semibold text-zinc-900 leading-snug")
									| List three writers or publications you're currently following.
								input#followed-writers(
									v-model="followedWriters"
									type="text"
									placeholder="e.g. Writer 1, Publication 2, Writer 3"
									class="w-full border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
								)

							//- Cloudflare Turnstile
							div(class="flex justify-start")
								NuxtTurnstile(ref="turnstileRef" v-model="turnstileToken" :options="{ size: 'flexible', theme: 'light', action: 'volunteer_apply' }")

							//- Error message if validation fails
							p(v-if="errorMessage" class="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2")
								| {{ errorMessage }}

							//- Submit Button
							button(
								type="submit"
								:disabled="isSubmitting"
								class="w-full bg-black text-white hover:bg-brand-accent py-3.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer disabled:opacity-50 mt-1"
							)
								span(v-if="!isSubmitting") Apply
								span(v-else class="flex items-center justify-center gap-2") Submitting...
</template>
