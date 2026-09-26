<script setup lang="ts">
defineProps({
	show: Boolean,
})
</script>

<template lang="pug">
div
	Transition(name="overlay")
		div(v-if="show" @click="$emit('toggleShow')" class="overlay fixed top-0 left-0 z-10 w-full h-dvh bg-black/70")
	Transition(name="nav")
		nav(class="fixed top-0 right-0 z-50 bg-white w-2/3 lg:w-1/3 h-screen p-8" v-if="show")
			div(class="mb-16 flex flex-col h-full")
				div(class="nav-header flex items-center mb-12")
					button(type="button" aria-label="Close menu" class="ms-auto cursor-pointer text-black hover:text-brand-accent duration-300" @click="$emit('toggleShow')")
						svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5")
							path(fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z")
				ul(class="*:tracking-tight *:text-black *:capitalize space-y-4 block")
					li(v-for="(item, index) in NAV_LINKS" :key="index") #[NuxtLink(:to="item.href" activeClass='active-link' @click="$emit('toggleShow')") {{ item.name }}]
</template>

<style scoped>
.nav-enter-active, .nav-leave-active {
	transition: all 0.3s ease-in-out;
}

.nav-enter-from, .nav-leave-to {
	transform: translateX(100%);
}


.overlay-enter-active,
.overlay-leave-active {
	transition: all .4s;
	  transition-timing-function: ease-in;
}

.overlay-leave-to, .overlay-enter-from {
	  opacity: 0;
}
</style>