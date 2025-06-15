<template lang="pug">
section#about(class="py-20")
	.container(class="flex flex-col gap-8")
		h1(class="text-5xl tracking-tight font-bold") About Us
		p Grugbox is the world’s best music blog. It is independently owned and operated.
		.contact(class="flex flex-col gap-8")
			NuxtLink(to="mailto:info@grugbox.com" class="text-2xl uppercase font-extralight hover:text-brand-accent") info@grugbox.com
			.socials(class="flex items-center gap-8")
				NuxtLink(to="#")
					svgo-x(class="text-2xl text-zinc-400")
				NuxtLink(to="#")
					svgo-instagram(class="text-2xl text-zinc-400")
				NuxtLink(to="#")
					svgo-apple(class="text-2xl text-zinc-400")
				NuxtLink(to="#")
					svgo-spotify(class="text-2xl text-zinc-400")
</template>