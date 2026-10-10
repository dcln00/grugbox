<script setup lang="ts">
import { useWorkspaceLogin } from '~/composables/useWorkspaceLogin'

const { pending, error, configured, refresh, submit } = useWorkspaceLogin()

const password = ref('')

useHead({ title: 'Workspace — Grugbox' })
useSeoMeta({ robots: 'noindex, nofollow' })

onMounted(async () => {
	const authenticated = await refresh()
	if (authenticated) await navigateTo('/workspace')
})

const onSubmit = async (): Promise<void> => {
	await submit(password.value)
}
</script>

<template lang="pug">
div(class="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6")
	div(class="w-full max-w-sm flex flex-col gap-8")

		div(v-if="!configured" class="border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200")
			| #[strong WORKSPACE_PASSWORD] is not set. Add it to #[code .env] and to your Vercel environment variables, then restart.

		form(v-else class="flex flex-col gap-4" @submit.prevent="onSubmit")
			label(class="flex flex-col gap-2")
				span(class="text-[11px] font-bold uppercase tracking-wide text-zinc-400") Team password
				input(
					v-model="password"
					type="password"
					autocomplete="current-password"
					:disabled="pending"
					class="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm outline-none duration-200 focus:border-white disabled:opacity-50"
				)

			p(v-if="error" class="text-sm text-red-400") {{ error }}

			button(
				type="submit"
				:disabled="pending || !password"
				class="bg-white text-black text-[11px] font-bold uppercase tracking-wide py-3 duration-200 hover:bg-zinc-200 disabled:opacity-40"
			) {{ pending ? 'Checking…' : 'Enter workspace' }}
</template>
