import { useCookie } from '#app'

export function useSubscriptionStorage() {
  const isSubscribedCookie = useCookie<boolean>('grugbox_subscribed', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    default: () => false,
  })

  const isDismissedCookie = useCookie<boolean>('grugbox_modal_dismissed', {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    default: () => false,
  })

  const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7
  const ONE_WEEK_MS = ONE_WEEK_SECONDS * 1000

  const setSubscribed = (value: boolean) => {
    isSubscribedCookie.value = value
    if (typeof window !== 'undefined') {
      localStorage.setItem('grugbox_subscribed', value ? 'true' : 'false')
      if (value) {
        const email = localStorage.getItem('grugbox_subscribed_email')
        if (email) {
          localStorage.setItem('grugbox_subscribed_email', email)
        }
      }
    }
  }

  const setDismissed = (value: boolean, email?: string) => {
    isDismissedCookie.value = value
    if (typeof window !== 'undefined') {
      localStorage.setItem('grugbox_modal_dismissed', value ? 'true' : 'false')
      if (value && email) {
        const expiry = Date.now() + ONE_WEEK_MS
        localStorage.setItem('grugbox_modal_dismissed', 'true')
        localStorage.setItem('grugbox_modal_dismissed_until', expiry.toString())
      } else if (!value) {
        localStorage.removeItem('grugbox_modal_dismissed')
        localStorage.removeItem('grugbox_modal_dismissed_until')
      }
    }
  }

  const getSubscribedEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('grugbox_subscribed_email')
    }
    return null
  }

  const setSubscribedEmail = (email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('grugbox_subscribed_email', email)
    }
  }

  const clearDismissedUntil = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grugbox_modal_dismissed_until')
    }
  }

  return {
    isSubscribedCookie,
    isDismissedCookie,
    setSubscribed,
    setDismissed,
    getSubscribedEmail,
    setSubscribedEmail,
    clearDismissedUntil,
    ONE_WEEK_SECONDS,
    ONE_WEEK_MS
  }
}