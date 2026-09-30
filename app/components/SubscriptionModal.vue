<script setup lang="ts">
const emit = defineEmits<{
	(e: 'close'): void
	(e: 'subscribed', email: string): void
}>()

const isSubscribedCookie = useCookie<boolean>('grugbox_subscribed', {
	maxAge: 60 * 60 * 24 * 365, // 1 year
	default: () => false,
})

const isModalOpen = ref(!isSubscribedCookie.value)
const modalEmail = ref('')
const modalName = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const isAlreadySubscribed = ref(false)
const submittedEmail = ref('')
const errorMessage = ref('')

async function handleSubscribe() {
	errorMessage.value = ''
	const emailVal = modalEmail.value.trim()
	const nameVal = modalName.value.trim()
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailVal || !emailRegex.test(emailVal)) {
		errorMessage.value = 'Please enter a valid email address.'
		return
	}

	isSubmitting.value = true
	try {
		const res = await $fetch<{ ok: boolean, email?: string, alreadySubscribed?: boolean }>('/api/subscribe', {
			method: 'POST',
			body: {
				email: emailVal,
				name: nameVal || undefined,
				source: 'modal',
			},
		})
		submittedEmail.value = emailVal
		isAlreadySubscribed.value = Boolean(res?.alreadySubscribed)
		isSuccess.value = true
		isSubscribedCookie.value = true
		if (import.meta.client) {
			localStorage.setItem('grugbox_subscribed', 'true')
			localStorage.setItem('grugbox_subscribed_email', emailVal)
		}
		emit('subscribed', emailVal)

		// Automatically close the modal after brief confirmation
		setTimeout(() => {
			closeModal()
		}, 1500)
	} catch (err: any) {
		errorMessage.value = err?.data?.statusMessage || err?.message || 'Failed to submit. Please try again.'
	} finally {
		isSubmitting.value = false
	}
}

function closeModal() {
	// The modal should only close after the user has input a valid email address
	if (!isSuccess.value) return
	isSubscribedCookie.value = true
	if (import.meta.client) {
		localStorage.setItem('grugbox_subscribed', 'true')
	}
	isModalOpen.value = false
	emit('close')
}

onMounted(() => {
	if (localStorage.getItem('grugbox_subscribed') === 'true') {
		isModalOpen.value = false
		isSubscribedCookie.value = true
	}
})

// Lock scroll when modal is active
if (import.meta.client) {
	let scrollPosition = 0

	const lockScroll = () => {
		scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
		document.documentElement.style.overflow = 'hidden'
		document.body.style.overflow = 'hidden'
		document.body.style.position = 'fixed'
		document.body.style.top = `-${scrollPosition}px`
		document.body.style.width = '100%'
	}

	const unlockScroll = () => {
		document.documentElement.style.overflow = ''
		document.body.style.overflow = ''
		document.body.style.position = ''
		document.body.style.top = ''
		document.body.style.width = ''
		window.scrollTo(0, scrollPosition)
	}

	watch(isModalOpen, (open) => {
		if (open) {
			lockScroll()
		} else {
			unlockScroll()
		}
	}, { immediate: true })

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && isSuccess.value) {
			closeModal()
		}
	}

	window.addEventListener('keydown', handleKeyDown)

	onBeforeUnmount(() => {
		unlockScroll()
		window.removeEventListener('keydown', handleKeyDown)
	})
}
</script>

<template lang="pug">
Teleport(to="body")
	Transition(name="modal-fade")
		div(
			v-if="isModalOpen"
			role="dialog"
			aria-modal="true"
			aria-labelledby="subscription-modal-title"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto overscroll-contain"
			@touchmove.self.prevent
		)
			div(class="w-full max-w-lg bg-white p-6 sm:p-8 shadow-2xl relative my-auto" @click.stop)
				//- Success State
				div(v-if="isSuccess" class="border-2 border-black p-6 sm:p-8 bg-zinc-50 flex flex-col items-start gap-4 mt-6")
					div(class="flex items-center gap-3")
						div(class="size-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm") ✓
						span(v-if="isAlreadySubscribed" class="text-xs font-bold uppercase tracking-widest text-brand-accent") Already Subscribed
						span(v-else class="text-xs font-bold uppercase tracking-widest text-brand-accent") Subscription Confirmed
					h3(class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900")
						span(v-if="isAlreadySubscribed") Welcome back!
						span(v-else) You are on the list.
					p(class="text-xs sm:text-sm text-zinc-600 leading-relaxed")
						span(v-if="isAlreadySubscribed")
							| #[strong(class="text-zinc-900") {{ submittedEmail }}] is already on our dispatch list. Closing modal...
						span(v-else)
							| We have registered #[strong(class="text-zinc-900") {{ submittedEmail }}] to receive our latest dispatches. Closing modal...
					button(
						type="button"
						@click="closeModal"
						class="mt-2 w-full bg-black text-white hover:bg-brand-accent py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer"
					) Enter Site

				//- Subscription Form
				div(v-else class="flex flex-col gap-6 pt-5")
					div(class="flex flex-col gap-1.5")
						span(class="text-[10px] uppercase font-bold tracking-widest text-brand-accent") Join Our Readers
						h2#subscription-modal-title(class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900") Subscribe to our newsletter
						p(class="text-xs sm:text-sm text-zinc-600") Enter your details below to receive our latest stories, reviews, and dispatches.

					form(@submit.prevent="handleSubscribe" class="flex flex-col gap-5")
						//- Email Input
						div(class="flex flex-col gap-2")
							label(for="modal-email-input" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
								| Email Address #[span(class="text-brand-accent") *]
							input#modal-email-input(
								v-model="modalEmail"
								type="email"
								required
								placeholder="Enter your email address"
								class="w-full border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
							)

						//- Name Input
						div(class="flex flex-col gap-2")
							label(for="modal-name-input" class="text-[11px] font-bold uppercase tracking-wider text-zinc-900")
								| Name
							input#modal-name-input(
								v-model="modalName"
								type="text"
								placeholder="Your name"
								class="w-full border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:border-black focus:outline-none transition-colors"
							)

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

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
</style>
