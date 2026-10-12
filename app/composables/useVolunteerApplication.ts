import type { MaybeRefOrGetter } from 'vue'

const INTEREST_OPTIONS = ['Fashion', 'Film & TV', 'Music', 'Visual Art', 'Society & Culture']
const DEFAULT_INTEREST = 'Music'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.'

interface ApplicationPayload {
	firstName: string
	lastName: string
	email: string
	linkedinUrl: string
	portfolioUrl: string
	socialHandle: string
	areaOfInterest: string
	location: string
	storyPitch: string
	visualConcept: string
	followedWriters: string
	roleSlug: string
	token: string
}

interface UseVolunteerApplicationOptions {
	/** Lets the page reset the Turnstile widget once a token has been spent. */
	onChallengeReset?: () => void
}

interface FetchErrorLike {
	message?: string
	data?: { statusMessage?: string }
}

function isFetchErrorLike(error: unknown): error is FetchErrorLike {
	return typeof error === 'object' && error !== null && 'message' in error
}

function readErrorMessage(error: unknown): string {
	if (isFetchErrorLike(error)) {
		return error.data?.statusMessage || error.message || FALLBACK_ERROR_MESSAGE
	}

	return FALLBACK_ERROR_MESSAGE
}

/**
 * Application form state for a single volunteer role.
 *
 * The server re-validates everything and resolves the role title from the slug,
 * so none of this is trusted — the checks here exist to fail fast in the UI.
 */
export function useVolunteerApplication(getRoleSlug: MaybeRefOrGetter<string>, options: UseVolunteerApplicationOptions = {}) {
	const firstName = ref('')
	const lastName = ref('')
	const email = ref('')
	const linkedinUrl = ref('')
	const portfolioUrl = ref('')
	const socialHandle = ref('')
	const areaOfInterest = ref(DEFAULT_INTEREST)
	const location = ref('')
	const storyPitch = ref('')
	const visualConcept = ref('')
	const followedWriters = ref('')
	const turnstileToken = ref('')

	const isSubmitting = ref(false)
	const isSubmitted = ref(false)
	const errorMessage = ref('')

	function validate(): string | null {
		if (!firstName.value.trim() || !lastName.value.trim()) {
			return 'Please enter both first and last names.'
		}

		if (!EMAIL_PATTERN.test(email.value.trim())) {
			return 'Please enter a valid email address.'
		}

		if (!portfolioUrl.value.trim()) {
			return 'Please provide a link to your portfolio or published work.'
		}

		if (!areaOfInterest.value) {
			return 'Please choose your primary area of interest.'
		}

		if (!location.value.trim()) {
			return 'Please let us know where you are currently based.'
		}

		if (!storyPitch.value.trim()) {
			return 'Please share a story idea or topic you would love to cover.'
		}

		return null
	}

	function toPayload(): ApplicationPayload {
		return {
			firstName: firstName.value.trim(),
			lastName: lastName.value.trim(),
			email: email.value.trim(),
			linkedinUrl: linkedinUrl.value.trim(),
			portfolioUrl: portfolioUrl.value.trim(),
			socialHandle: socialHandle.value.trim(),
			areaOfInterest: areaOfInterest.value,
			location: location.value.trim(),
			storyPitch: storyPitch.value.trim(),
			visualConcept: visualConcept.value.trim(),
			followedWriters: followedWriters.value.trim(),
			roleSlug: toValue(getRoleSlug),
			token: turnstileToken.value,
		}
	}

	async function submit(): Promise<void> {
		errorMessage.value = ''

		const invalidReason = validate()
		if (invalidReason) {
			errorMessage.value = invalidReason
			return
		}

		isSubmitting.value = true

		try {
			await $fetch('/api/volunteer-apply', {
				method: 'POST',
				body: toPayload(),
			})
			isSubmitted.value = true
		} catch (error) {
			// A Turnstile token is single-use, so a retry needs a fresh one.
			turnstileToken.value = ''
			options.onChallengeReset?.()
			errorMessage.value = readErrorMessage(error)
		} finally {
			isSubmitting.value = false
		}
	}

	function reset(): void {
		firstName.value = ''
		lastName.value = ''
		email.value = ''
		linkedinUrl.value = ''
		portfolioUrl.value = ''
		socialHandle.value = ''
		areaOfInterest.value = DEFAULT_INTEREST
		location.value = ''
		storyPitch.value = ''
		visualConcept.value = ''
		followedWriters.value = ''
		turnstileToken.value = ''
		options.onChallengeReset?.()
		isSubmitted.value = false
		errorMessage.value = ''
	}

	return {
		firstName,
		lastName,
		email,
		linkedinUrl,
		portfolioUrl,
		socialHandle,
		areaOfInterest,
		location,
		storyPitch,
		visualConcept,
		followedWriters,
		turnstileToken,
		interestOptions: INTEREST_OPTIONS,
		isSubmitting,
		isSubmitted,
		errorMessage,
		submit,
		reset,
	}
}
