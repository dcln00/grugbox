import { useLocalStorage } from '@vueuse/core'

import { CATEGORY_PRESETS, normalizeCategory } from '~/utils/workspace/categories'

const STORAGE_KEY = 'grugbox_workspace_categories'
const MAX_RECENTS = 12

/**
 * The only thing that survives a refresh — attachments cannot, by design, so
 * remembering category labels saves the most retyping for the least state.
 */
export function useRecentCategories() {
	const recents = useLocalStorage<string[]>(STORAGE_KEY, [])

	const suggestions = computed<string[]>(() => {
		const seen = new Set(recents.value)
		return [...recents.value, ...CATEGORY_PRESETS.filter(preset => !seen.has(preset))]
	})

	const remember = (value: string): void => {
		const normalized = normalizeCategory(value)
		if (!normalized) return

		recents.value = [normalized, ...recents.value.filter(entry => entry !== normalized)].slice(
			0,
			MAX_RECENTS,
		)
	}

	return { recents, suggestions, remember }
}
