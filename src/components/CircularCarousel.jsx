import { useEffect, useRef, useState } from 'react'
import './CircularCarousel.css'

const modulo = (value, length) => ((value % length) + length) % length

function CircularCarousel({
  items = [],
  cardWidth = 210,
  aspectRatio = 3 / 4,
  gap = 24,
  interval = 3,
  cornerRadius = 16,
  ariaLabel = '日常视频作品',
  className = '',
}) {
  const count = items.length
  const step = count ? 360 / count : 0
  const radius = count ? (cardWidth + gap) / (2 * Math.sin(Math.PI / count)) : 0
  const cardHeight = cardWidth / aspectRatio
  const [rotation, setRotation] = useState(0)
  const [active, setActive] = useState(0)
  const rotationRef = useRef(0)
  const timerRef = useRef(0)
  const wheelStopRef = useRef(0)
  const rootRef = useRef(null)

  const syncRotation = nextRotation => {
    rotationRef.current = nextRotation
    setRotation(nextRotation)
    setActive(modulo(Math.round(-nextRotation / step), count || 1))
  }

  const scheduleNext = () => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      syncRotation(rotationRef.current - step)
      scheduleNext()
    }, interval * 1000)
  }

  useEffect(() => {
    if (!count) return undefined
    scheduleNext()
    return () => {
      window.clearTimeout(timerRef.current)
      window.clearTimeout(wheelStopRef.current)
    }
  }, [count, interval, step])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const preventPageScroll = event => {
      if (event.deltaX || event.deltaY) event.preventDefault()
    }

    root.addEventListener('wheel', preventPageScroll, { passive: false })
    return () => root.removeEventListener('wheel', preventPageScroll)
  }, [])

  const rotateByStep = direction => {
    if (!count) return
    window.clearTimeout(timerRef.current)
    window.clearTimeout(wheelStopRef.current)
    syncRotation(rotationRef.current - direction * step)
    scheduleNext()
  }
  const handleWheel = event => {
    if (!count) return
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (!delta) return

    event.preventDefault()
    window.clearTimeout(timerRef.current)
    window.clearTimeout(wheelStopRef.current)

    const amount = Math.sign(delta) * Math.min(Math.abs(delta), 90) * 0.34
    const next = rotationRef.current - amount
    rotationRef.current = next
    setRotation(next)
    setActive(modulo(Math.round(-next / step), count || 1))

    wheelStopRef.current = window.setTimeout(() => {
      const target = Math.round(rotationRef.current / step) * step
      syncRotation(target)
      scheduleNext()
    }, 180)
  }

  if (!count) return null

  return (
    <div
      ref={rootRef}
      className={'circular-carousel ' + className}
      style={{
        '--carousel-card-width': cardWidth + 'px',
        '--carousel-card-height': cardHeight + 'px',
        '--carousel-radius': radius + 'px',
        '--carousel-corner-radius': cornerRadius + 'px',
        '--carousel-rotation': rotation + 'deg',
      }}
      onWheel={handleWheel}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className="circular-carousel__viewport">
        <div className="circular-carousel__ring">
          {items.map((item, index) => {
            const distance = Math.abs(((index - active + count / 2) % count) - count / 2)
            const scale = 1 + Math.max(0, 1 - distance) * 0.14
            return (
              <a
                className={'circular-carousel__card ' + (index === active ? 'is-active' : '')}
                key={item.href || item.src || item.video}
                href={item.href}
                data-carousel-index={index}
                aria-label={'播放 ' + (item.title || item.alt || '视频 ' + (index + 1))}
                style={{
                  '--card-angle': index * step + 'deg',
                  '--card-scale': scale,
                }}
              >
                {item.src ? (
                  <img src={item.src} alt={item.alt || item.title || ''} draggable="false" />
                ) : item.video ? (
                  <video
                    src={item.video}
                    aria-label={item.alt || item.title || ''}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : null}
              </a>
            )
          })}
        </div>
      </div>
      <div className="circular-carousel__caption" aria-live="polite">
        <button
          className="circular-carousel__arrow"
          type="button"
          aria-label="上一件作品"
          title="上一件作品"
          onClick={() => rotateByStep(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="circular-carousel__caption-info">
          <span>{items[active]?.title || items[active]?.alt}</span>
          <small>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</small>
        </div>
        <button
          className="circular-carousel__arrow"
          type="button"
          aria-label="下一件作品"
          title="下一件作品"
          onClick={() => rotateByStep(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

export default CircularCarousel
