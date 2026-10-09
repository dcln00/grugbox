<script setup lang="ts">
const props = defineProps<{
  src?: string
}>()

onMounted(() => {
  if (props.src) {
    const s = document.createElement('script')
    s.src = props.src.startsWith('//') ? `https:${props.src}` : props.src
    s.async = true
    s.onload = () => {
      if (typeof window !== 'undefined' && (window as any).instgrm) {
        (window as any).instgrm.Embeds.process()
      }
    }
    document.head.appendChild(s)
  }
})
</script>

<template lang="pug">
//- ProseScript intentionally renders nothing to suppress dangerous script warning
</template>
