import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 滚动视差效果：当页面向下滚动时，元素逐渐向上移动并隐藏到下一个板块下方
 * @param containerRef - 要应用效果的容器元素 ref
 * @param options - 配置项
 */
export function useScrollParallax(
  containerRef: Ref<HTMLElement | null>,
  options: {
    /** 效果生效的滚动距离（px），默认 400 */
    distance?: number
    /** 元素上移的最大距离（px），默认 100 */
    maxTranslateY?: number
  } = {}
) {
  const { distance = 400, maxTranslateY = 100 } = options
  const scrollY = ref(0)
  const opacity = ref(1)
  const translateY = ref(0)
  const scale = ref(1)

  function onScroll() {
    scrollY.value = window.scrollY
    const progress = Math.min(scrollY.value / distance, 1)
    opacity.value = 1 - progress
    translateY.value = -maxTranslateY * progress
    scale.value = 1 - progress * 0.03
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { scrollY, opacity, translateY, scale }
}

