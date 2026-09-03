import { useEffect, useRef, useState } from 'react'

// Tuned for a message bubble, not a full-screen gesture: the reveal is capped well short of
// the bubble's own width, and only a modest finger-travel is needed to commit — this is a
// quick nudge, not a drag-across-the-screen interaction.
const DRAG_MAX = 56
const THRESHOLD = 44
const DIRECTION_DEAD_ZONE = 8

/**
 * Swipe-right-to-reply for a single message bubble. Attaches native (non-passive) touch
 * listeners via `ref` so horizontal drags can call preventDefault without fighting React's
 * passive-by-default touch handlers, while leaving vertical drags untouched so chat scrolling
 * is never intercepted — direction is decided once per gesture, after a small dead zone, from
 * whichever axis the finger moved further on first.
 */
export function useSwipeToReply<T extends HTMLElement>({
  onTriggered,
  enabled = true,
}: {
  onTriggered: () => void
  enabled?: boolean
}) {
  const ref = useRef<T | null>(null)
  const [revealWidth, setRevealWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const onTriggeredRef = useRef(onTriggered)
  onTriggeredRef.current = onTriggered

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    let direction: 'horizontal' | 'vertical' | null = null
    let startX = 0
    let startY = 0
    let dx = 0
    let rafId: number | null = null

    function scheduleReveal(width: number) {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        setRevealWidth(width)
      })
    }

    function handleStart(e: TouchEvent) {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      direction = null
      dx = 0
    }

    function handleMove(e: TouchEvent) {
      const touch = e.touches[0]
      const rawDx = touch.clientX - startX
      const rawDy = touch.clientY - startY

      if (direction === null) {
        if (Math.abs(rawDx) < DIRECTION_DEAD_ZONE && Math.abs(rawDy) < DIRECTION_DEAD_ZONE) return
        direction = Math.abs(rawDx) > Math.abs(rawDy) ? 'horizontal' : 'vertical'
        if (direction === 'horizontal') setIsDragging(true)
      }

      if (direction !== 'horizontal') return // let native vertical scrolling proceed untouched

      e.preventDefault()
      dx = rawDx > 0 ? rawDx : 0 // swipe RIGHT only — leftward movement is a no-op, not a reverse gesture
      scheduleReveal(Math.min(dx, DRAG_MAX))
    }

    function handleEnd() {
      if (direction === 'horizontal' && dx >= THRESHOLD) {
        onTriggeredRef.current()
      }
      direction = null
      dx = 0
      setIsDragging(false)
      setRevealWidth(0)
    }

    el.addEventListener('touchstart', handleStart, { passive: true })
    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd, { passive: true })
    el.addEventListener('touchcancel', handleEnd, { passive: true })

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
      el.removeEventListener('touchcancel', handleEnd)
    }
  }, [enabled])

  return {
    ref,
    isDragging,
    revealWidth,
    revealOpacity: Math.min(revealWidth / THRESHOLD, 1),
  }
}
