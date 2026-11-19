import { useCallback, useEffect, useRef } from 'react'
import './BorderGlow.css'

function parseHSL(value) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 43, s: 55, l: 63 }
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) }
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  return Object.fromEntries(opacities.map((opacity, index) => [
    `--glow-color${keys[index]}`,
    `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`,
  ]))
}

const gradientPositions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const gradientKeys = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven']
const colorMap = [0, 1, 2, 0, 1, 2, 1]

function buildGradientVars(colors) {
  const safeColors = colors.length ? colors : ['#D4B37E']
  const vars = Object.fromEntries(gradientKeys.map((key, index) => {
    const color = safeColors[Math.min(colorMap[index], safeColors.length - 1)]
    return [key, `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`]
  }))
  vars['--gradient-base'] = `linear-gradient(${safeColors[0]} 0 100%)`
  return vars
}

function isLightColor(color) {
  const value = color.trim().replace('#', '')
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false
  const hex = value.length === 3 ? value.split('').map((char) => char + char).join('') : value
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180
}

export default function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '43 55 63',
  backgroundColor = '#000000',
  borderRadius = 0,
  glowRadius = 28,
  glowIntensity = 0.8,
  coneSpread = 25,
  animated = false,
  colors = ['#D4B37E', '#F5EFE3', '#D4B37E'],
  fillOpacity = 0.24,
}) {
  const cardRef = useRef(null)

  const getCenter = useCallback((element) => {
    const { width, height } = element.getBoundingClientRect()
    return [width / 2, height / 2]
  }, [])

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const [cx, cy] = getCenter(card)
    const dx = x - cx
    const dy = y - cy
    const edgeX = dx === 0 ? Infinity : cx / Math.abs(dx)
    const edgeY = dy === 0 ? Infinity : cy / Math.abs(dy)
    const edge = Math.min(Math.max(1 / Math.min(edgeX, edgeY), 0), 1)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`)
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
  }, [getCenter])

  useEffect(() => {
    if (!animated || !cardRef.current) return undefined
    const card = cardRef.current
    card.classList.add('sweep-active')
    card.style.setProperty('--edge-proximity', '100')
    card.style.setProperty('--cursor-angle', '110deg')
    const timer = window.setTimeout(() => card.classList.remove('sweep-active'), 1800)
    return () => window.clearTimeout(timer)
  }, [animated])

  const lightSurface = isLightColor(backgroundColor)
  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card${lightSurface ? ' border-glow-card--light' : ''} ${className}`.trim()}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}
