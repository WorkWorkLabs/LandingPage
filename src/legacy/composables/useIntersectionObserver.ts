import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const sectionRef: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!sectionRef.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(sectionRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    sectionRef,
    isVisible
  }
}
