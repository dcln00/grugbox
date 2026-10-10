<script setup lang="ts">
import { GRUGBOX_LOGO_PATHS, GRUGBOX_LOGO_VIEWBOX } from '~/utils/logo'

const viewBox = `0 0 ${GRUGBOX_LOGO_VIEWBOX.width} ${GRUGBOX_LOGO_VIEWBOX.height}`
</script>

<template>
<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" fill="currentColor">
  <path v-for="(path, index) in GRUGBOX_LOGO_PATHS" :key="index" :d="path"/>
</svg>
</template>
