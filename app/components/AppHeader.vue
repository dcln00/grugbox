<script setup lang="ts">
const { y } = useWindowScroll()
const isNotScrolled = computed(() => y.value < 200)
</script>

<template lang="pug">
div
	header(class="bg-zinc-900")
		HeaderBar(@toggle-show="$emit('toggleShow')")

	Transition(name="nav")
		header(v-if="!isNotScrolled" class="fixed top-0 w-full bg-zinc-900 z-10")
			HeaderBar(@toggle-show="$emit('toggleShow')")
</template>

<style scoped>
.nav-enter-active, .nav-leave-active {
	transition: all 0.25s ease-in-out;
}

.nav-enter-from, .nav-leave-to {
	transform: translateY(-100%);
}
</style>
