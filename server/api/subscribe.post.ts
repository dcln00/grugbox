import { setDefaultResultOrder } from "node:dns"

try {
	setDefaultResultOrder("ipv4first")
} catch {}

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const email = typeof body?.email === 'string' ? body.email.trim() : ''
	const name = typeof body?.name === 'string' ? body.name.trim() : ''

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!email || !emailRegex.test(email)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Please enter a valid email address.',
		})
	}

	const config = useRuntimeConfig()
	const scriptUrl = (config.googleAppsScriptUrl as string) || process.env.GOOGLE_APPS_SCRIPT_URL || ''

	if (!scriptUrl) {
		console.warn('[Subscription] GOOGLE_APPS_SCRIPT_URL is not set in environment or runtimeConfig.')
		return {
			ok: true,
			warning: 'GOOGLE_APPS_SCRIPT_URL is not configured yet. Subscription logged.',
			subscriber: { email, name, timestamp: new Date().toISOString() },
		}
	}

	try {
		// Include parameters in URL and JSON payload so any Google Apps Script implementation works:
		// (whether reading e.parameter or JSON.parse(e.postData.contents))
		const url = new URL(scriptUrl)
		url.searchParams.set('email', email)
		if (name) url.searchParams.set('name', name)
		url.searchParams.set('timestamp', new Date().toISOString())

		const payload = {
			email,
			name,
			source: body?.source || 'modal',
			timestamp: new Date().toISOString(),
		}

		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
			redirect: 'follow',
		})

		const text = await response.text()
		let data: any = null
		try {
			data = JSON.parse(text)
		} catch {}

		const alreadySubscribed = data?.status === 'already_subscribed' || data?.alreadySubscribed === true

		return {
			ok: true,
			email,
			alreadySubscribed,
		}
	} catch (error: any) {
		console.error('[Subscription] Failed to forward to Google Apps Script:', error)
		throw createError({
			statusCode: 502,
			statusMessage: 'Failed to process subscription. Please try again later.',
		})
	}
})
