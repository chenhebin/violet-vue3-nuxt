/**
 * 播停观察器（basic/common 内部共享骨架）：目标进视口播、出视口停（threshold 0.4），
 * 返回停止函数（disconnect）。LottiePlayer / VideoPlayer 两个使用者 = 真 seam。
 */
export function observePlayPause(target: Element, play: () => void, pause: () => void): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.isIntersecting) play()
      else pause()
    },
    { threshold: 0.4 }
  )
  observer.observe(target)
  return () => observer.disconnect()
}
