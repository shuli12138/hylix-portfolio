import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './AccordionGallery.css'

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  accentColor = '#d4b37e',
  overlayColor = '#050403',
  textColor = '#ffffff',
  height = 520,
  gap = 12,
  radius = 18,
  expandRatio = 0.52,
  duration = 0.7,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 5,
  stagger = 0.06,
  trigger = 'hover',
  grayscale = true,
  className = '',
}) {
  const rootRef = useRef(null)
  const panelRefs = useRef([])
  const mediaRefs = useRef([])
  const barRefs = useRef([])
  const textRefs = useRef([])
  const timelineRef = useRef(null)
  const firstRunRef = useRef(true)
  const mediaSizeRef = useRef(320)
  const layoutRatioRef = useRef(expandRatio)
  const count = items.length
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1))

  const applyLayout = useCallback((animate) => {
    const panels = panelRefs.current
    if (!panels.length) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const ratio = layoutRatioRef.current
    const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1
    const mediaSize = mediaSizeRef.current
    const activeDuration = animate && !reduceMotion ? duration : 0

    timelineRef.current?.kill()
    const timeline = gsap.timeline()

    panels.forEach((panel, index) => {
      if (!panel) return
      const isActive = index === active
      const rotation = isActive ? 0 : index < active ? tilt : -tilt
      const media = mediaRefs.current[index]
      const bar = barRefs.current[index]
      const text = textRefs.current[index]

      timeline.to(panel, {
        flexGrow: isActive ? grow : 1,
        rotateY: rotation,
        duration: activeDuration,
        ease,
      }, 0)

      if (media) {
        const drift = Math.max(-1.5, Math.min(1.5, active - index))
        timeline.to(media, {
          xPercent: -50,
          yPercent: -50,
          x: isActive ? 0 : drift * parallax * mediaSize * 0.06,
          '--ag-gray': grayscale ? (isActive ? 0 : 1) : 0,
          '--ag-dim': isActive ? 0 : 0.42,
          duration: activeDuration,
          ease,
        }, 0)
      }

      if (bar && text) {
        if (isActive) {
          timeline.to([bar, text], {
            opacity: 1,
            x: 0,
            duration: activeDuration,
            ease,
            stagger: reduceMotion ? 0 : stagger,
          }, 0)
        } else {
          timeline.to([bar, text], {
            opacity: 0,
            x: -14,
            duration: activeDuration * 0.6,
            ease,
          }, 0)
        }
      }
    })

    timelineRef.current = timeline
  }, [active, count, duration, ease, expandRatio, grayscale, parallax, stagger, tilt])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const measure = () => {
      const rect = root.getBoundingClientRect()
      const usable = Math.max(rect.width - gap * (count - 1), 120)
      const portraitWidth = Math.max(140, rect.height * 0.75)
      layoutRatioRef.current = Math.min(Math.max(portraitWidth / usable, 0.2), 0.9)
      mediaSizeRef.current = portraitWidth
      root.style.setProperty('--ag-media-size', `${portraitWidth}px`)
      applyLayout(!firstRunRef.current)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [applyLayout, count, expandRatio, gap])

  useEffect(() => {
    applyLayout(!firstRunRef.current)
    firstRunRef.current = false
  }, [applyLayout])

  useEffect(() => () => {
    timelineRef.current?.kill()
  }, [])

  const activate = (index) => setActive(index)

  const handleKeyDown = (index, event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      activate((index + 1) % count)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      activate((index - 1 + count) % count)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery ${className}`.trim()}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        height: `${height}px`,
      }}
      role="list"
      aria-label="精选作品"
    >
      {items.map((item, index) => {
        const isActive = index === active
        const Tag = item.link ? 'a' : 'button'

        return (
          <Tag
            key={item.image}
            ref={(element) => { panelRefs.current[index] = element }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            href={item.link || undefined}
            type={item.link ? undefined : 'button'}
            onClick={(event) => {
              if (!isActive && !item.link) {
                event.preventDefault()
                activate(index)
              }
            }}
            onMouseEnter={() => { if (trigger === 'hover') activate(index) }}
            onFocus={() => activate(index)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span className="ag-panel__media" ref={(element) => { mediaRefs.current[index] = element }}>
                <img src={item.image} alt={item.alt || item.label} draggable="false" />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            <span className="ag-panel__label" aria-hidden="true">
              <span className="ag-panel__bar" ref={(element) => { barRefs.current[index] = element }} />
              <span className="ag-panel__text" ref={(element) => { textRefs.current[index] = element }}>
                <small>{String(index + 1).padStart(2, '0')}</small>
                {item.label}
              </span>
            </span>
          </Tag>
        )
      })}
    </div>
  )
}
