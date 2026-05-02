import { ref, onMounted, onUnmounted } from 'vue'

export function useTypewriter(words: string[], options?: {
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}) {
  const {
    typeSpeed = 150,
    deleteSpeed = 80,
    pauseDuration = 2000,
  } = options || {}

  const currentText = ref('')
  const isDeleting = ref(false)
  const wordIndex = ref(0)

  let timeout: ReturnType<typeof setTimeout> | null = null

  const tick = () => {
    const currentWord = words[wordIndex.value]

    if (!isDeleting.value) {
      currentText.value = currentWord.substring(0, currentText.value.length + 1)

      if (currentText.value === currentWord) {
        isDeleting.value = true
        timeout = setTimeout(tick, pauseDuration)
        return
      }
    } else {
      currentText.value = currentWord.substring(0, currentText.value.length - 1)

      if (currentText.value === '') {
        isDeleting.value = false
        wordIndex.value = (wordIndex.value + 1) % words.length
        timeout = setTimeout(tick, typeSpeed)
        return
      }
    }

    timeout = setTimeout(tick, isDeleting.value ? deleteSpeed : typeSpeed)
  }

  onMounted(() => {
    timeout = setTimeout(tick, 500)
  })

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout)
  })

  return {
    currentText,
    isDeleting,
    wordIndex,
  }
}
