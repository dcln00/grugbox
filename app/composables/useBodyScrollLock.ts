import { ref } from 'vue'

export function useBodyScrollLock() {
  const isLocked = ref(false)
  let scrollPosition = 0

  const lockScroll = () => {
    if (isLocked.value) return
    if (typeof window === 'undefined') return

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition}px`
    document.body.style.width = '100%'
    isLocked.value = true
  }

  const unlockScroll = () => {
    if (!isLocked.value) return
    if (typeof window === 'undefined') return

    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, scrollPosition)
    isLocked.value = false
  }

  // Cleanup on unmount
  const cleanup = () => {
    unlockScroll()
  }

  return {
    isLocked,
    lockScroll,
    unlockScroll,
    cleanup
  }
}