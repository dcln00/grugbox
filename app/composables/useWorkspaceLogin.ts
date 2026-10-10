interface WorkspaceSession {
	authenticated: boolean
	configured: boolean
}

const extractStatusMessage = (caught: unknown): string => {
	if (!caught || typeof caught !== 'object') return ''
	const data = (caught as { data?: unknown }).data
	if (!data || typeof data !== 'object') return ''

	for (const key of ['statusMessage', 'message'] as const) {
		const value = (data as Record<string, unknown>)[key]
		if (typeof value === 'string' && value) return value
	}
	return ''
}

export function useWorkspaceLogin() {
	const pending = ref(false)
	const error = ref('')
	const configured = ref(true)

	const refresh = async (): Promise<boolean> => {
		try {
			const session = await $fetch<WorkspaceSession>('/api/workspace/session')
			configured.value = session.configured
			return session.authenticated
		} catch (caught: unknown) {
			// Not fatal: the form still renders and submitting reports the real
			// error. Surfaced to the console so a broken endpoint is not silent.
			console.warn('[Workspace] session check failed', caught)
			return false
		}
	}

	const submit = async (password: string): Promise<void> => {
		if (pending.value || !password) return

		error.value = ''
		pending.value = true

		try {
			await $fetch('/api/workspace/login', { method: 'POST', body: { password } })
			await navigateTo('/workspace')
		} catch (caught: unknown) {
			error.value = extractStatusMessage(caught) || 'Could not sign in. Try again.'
		} finally {
			pending.value = false
		}
	}

	return { pending, error, configured, refresh, submit }
}
