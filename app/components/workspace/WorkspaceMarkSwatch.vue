<script setup lang="ts">
import { MARK_SHAPES, MARK_THEMES, MARK_VIEWBOX } from '~/utils/workspace/mark'
import type { MarkTheme } from '~/utils/workspace/mark'

defineProps<{ theme: MarkTheme }>()

const viewBox = `0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`
</script>

<template lang="pug">
//- Drawn from the same path data the canvas renders, so a swatch can never show
//- something the export will not.
svg(:viewBox="viewBox" aria-hidden="true")
	path(
		v-for="(shape, index) in MARK_SHAPES"
		:key="index"
		:d="shape.d"
		:fill="MARK_THEMES[theme][shape.tone]"
	)
</template>
