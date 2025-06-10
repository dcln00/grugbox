<script setup lang="ts">
useHead({
	title: 'Grugbox',
})

useSeoMeta({
	title: 'Grugbox',
	ogTitle: 'Grugbox',
	description: ``,
	ogDescription: ``,
	ogType: 'website',
	ogImage: '',
	ogUrl: '',
	twitterDescription: '',
})
</script>

<template lang="pug">
.body-outlet(class="flex flex-col min-h-screen")
	AppHeader
	main(class="lg:grow")
		NuxtPage
</template>