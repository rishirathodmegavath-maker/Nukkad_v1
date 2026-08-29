import { useLayoutEffect, useRef } from 'react'
import { clamp, measureGeometry, smooth, trough, type DockGeometry } from '@/lib/liquidDockGeometry'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

interface UseLiquidDockOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  svgRef: React.RefObject<SVGSVGElement | null>
  pathRef: React.RefObject<SVGPathElement | null>
  beadRef: React.RefObject<HTMLSpanElement | null>
  tabRefs: React.RefObject<(HTMLElement | null)[]>
  activeIndex: number
  onSelectIndex: (index: number) => void
}

interface Engine {
  layout: (animate: boolean) => void
}

/**
 * Ports the Meniscus liquid-nav engine (measure/trough/paint/spring loop/drag) onto
 * real DOM refs. Runs as a raw rAF loop writing directly to element style/attributes —
 * kept imperative, not React state per frame, to match the source's performance model.
 */
export function useLiquidDock({ containerRef, svgRef, pathRef, beadRef, tabRefs, activeIndex, onSelectIndex }: UseLiquidDockOptions) {
  const onSelectRef = useRef(onSelectIndex)
  const activeIndexRef = useRef(activeIndex)
  const engineRef = useRef<Engine | null>(null)

  onSelectRef.current = onSelectIndex
  activeIndexRef.current = activeIndex

  useLayoutEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    const path = pathRef.current
    const bead = beadRef.current
    if (!container || !svg || !path || !bead) return

    const gRef: { current: DockGeometry | null } = { current: null }
    const xRef = { current: 0 }
    const vRef = { current: 0 }
    const targetRef = { current: 0 }
    const draggingRef = { current: false }
    const rafRef = { current: 0 }
    const lastRef = { current: 0 }
    const wasDragRef = { current: false }

    function measure(): boolean {
      const tabs = tabRefs.current ?? []
      if (!container || !svg || tabs.length === 0 || tabs.some((t) => !t)) return false
      const rect = container.getBoundingClientRect()
      const centers = tabs.map((t) => {
        const b = t!.getBoundingClientRect()
        return b.left - rect.left + b.width / 2
      })
      const g = measureGeometry(rect.width, rect.height, centers)
      if (!g) return false
      gRef.current = g
      svg.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`)
      container.style.setProperty('--dock-r', `${g.R.toFixed(1)}px`)
      container.style.setProperty('--bead-d', `${g.D}px`)
      container.style.setProperty('--bead-cy', `${g.CY}px`)
      container.style.setProperty('--rise', `${(g.H / 2 - g.CY).toFixed(1)}px`)
      return true
    }

    function paint() {
      const g = gRef.current
      if (!g || !path || !bead) return
      const x = xRef.current
      const v = vRef.current
      const dragging = draggingRef.current
      const q = clamp(v / 1100, -1, 1) * (dragging ? 0.5 : 1)
      const mag = Math.abs(q)

      const sL = clamp(g.S * (1 + 0.06 * mag + 0.4 * q), g.S * 0.55, g.S * 2.1)
      const sR = clamp(g.S * (1 + 0.06 * mag - 0.4 * q), g.S * 0.55, g.S * 2.1)

      path.setAttribute('d', trough(x, g.CY, g.RB, sL, sR, g.W, g.H, g.R))

      const sx = 1 + 0.07 * mag
      bead.style.transform = `translate3d(${x.toFixed(2)}px,0,0) scale(${sx.toFixed(3)},${(1 / sx).toFixed(3)})`

      const tabs = tabRefs.current ?? []
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i]
        if (!tab) continue
        const dx = Math.abs(x - g.slots[i])
        tab.style.setProperty('--t', smooth(clamp(1 - dx / (g.span * 0.55), 0, 1)).toFixed(3))
      }
    }

    function run() {
      if (rafRef.current) return
      lastRef.current = performance.now()
      rafRef.current = requestAnimationFrame(loop)
    }

    function loop(now: number) {
      rafRef.current = 0
      const dt = Math.min((now - lastRef.current) / 1000, 1 / 30)
      lastRef.current = now

      const dragging = draggingRef.current
      const K = dragging ? 900 : 142
      const C = dragging ? 52 : 19.3
      let step = dt
      while (step > 0) {
        const h = Math.min(step, 1 / 240)
        vRef.current += (-K * (xRef.current - targetRef.current) - C * vRef.current) * h
        xRef.current += vRef.current * h
        step -= h
      }

      paint()
      if (Math.abs(xRef.current - targetRef.current) > 0.05 || Math.abs(vRef.current) > 0.6 || draggingRef.current) {
        run()
      } else {
        xRef.current = targetRef.current
        vRef.current = 0
        paint()
      }
    }

    function jump(to: number) {
      targetRef.current = to
      if (reduced() && !draggingRef.current) {
        xRef.current = to
        vRef.current = 0
        paint()
        return
      }
      run()
    }

    function layout(animate: boolean) {
      if (!measure()) return
      const g = gRef.current!
      const to = g.slots[clamp(activeIndexRef.current, 0, g.slots.length - 1)]
      if (animate) jump(to)
      else {
        xRef.current = to
        targetRef.current = to
        vRef.current = 0
        paint()
      }
      container?.classList.add('is-ready')
    }

    engineRef.current = { layout }

    let startX = 0
    let pointerId: number | null = null

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      pointerId = e.pointerId
      startX = e.clientX
      wasDragRef.current = false
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerId !== pointerId || !container) return
      const g = gRef.current
      if (!g) return
      if (!draggingRef.current && Math.abs(e.clientX - startX) < 7) return
      if (!draggingRef.current) {
        draggingRef.current = true
        wasDragRef.current = true
        container.classList.add('is-dragging')
        container.setPointerCapture(pointerId)
      }
      e.preventDefault()
      const left = container.getBoundingClientRect().left
      targetRef.current = clamp(e.clientX - left, g.slots[0], g.slots[g.slots.length - 1])
      run()
    }

    function onPointerRelease(e: PointerEvent) {
      if (e.pointerId !== pointerId || !container) return
      pointerId = null
      if (!draggingRef.current) return
      draggingRef.current = false
      container.classList.remove('is-dragging')
      const g = gRef.current
      if (!g) return
      let near = 0
      let nd = Infinity
      g.slots.forEach((s, i) => {
        const d = Math.abs(targetRef.current - s)
        if (d < nd) {
          nd = d
          near = i
        }
      })
      jump(g.slots[near])
      if (near !== activeIndexRef.current) onSelectRef.current(near)
    }

    function onClickCapture(e: MouseEvent) {
      if (wasDragRef.current) {
        e.preventDefault()
        e.stopPropagation()
        wasDragRef.current = false
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerRelease)
    container.addEventListener('pointercancel', onPointerRelease)
    container.addEventListener('click', onClickCapture, true)

    const resizeObserver = new ResizeObserver(() => layout(false))
    resizeObserver.observe(container)

    layout(false)
    document.fonts?.ready.then(() => layout(false))

    return () => {
      engineRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerRelease)
      container.removeEventListener('pointercancel', onPointerRelease)
      container.removeEventListener('click', onClickCapture, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    engineRef.current?.layout(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])
}
