/**
 * Knob — SVG rotary knob control.
 *
 * Drag up/down to change value. Shows label and formatted value.
 */

import { useCallback, useRef } from 'react'

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  default?: number
  onChange: (value: number) => void
  size?: number
  color?: string
  unit?: string
  scaling?: 'linear' | 'exp' | 'log'
  step?: number
}

const ARC_START = -135
const ARC_END = 135
const ARC_RANGE = ARC_END - ARC_START

export function Knob({
  label,
  value,
  min,
  max,
  default: defaultVal,
  onChange,
  size = 48,
  color = '#E3C330',
  unit = '',
  scaling = 'linear',
  step,
}: KnobProps) {
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null)

  const normalize = (v: number): number => {
    const clamped = Math.max(min, Math.min(max, v))
    if (scaling === 'exp' && min > 0) {
      return Math.log(clamped / min) / Math.log(max / min)
    }
    return (clamped - min) / (max - min)
  }

  const denormalize = (n: number): number => {
    const c = Math.max(0, Math.min(1, n))
    if (scaling === 'exp' && min > 0) {
      return min * Math.pow(max / min, c)
    }
    return min + c * (max - min)
  }

  const normalized = normalize(value)
  const angle = ARC_START + normalized * ARC_RANGE

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = { startY: e.clientY, startValue: normalized }
      const el = e.currentTarget as HTMLElement
      el.setPointerCapture(e.pointerId)
    },
    [normalized]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return
      e.stopPropagation()
      const dy = dragRef.current.startY - e.clientY
      const sensitivity = 0.005
      let newNorm = dragRef.current.startValue + dy * sensitivity
      newNorm = Math.max(0, Math.min(1, newNorm))
      let newVal = denormalize(newNorm)
      if (step) {
        newVal = Math.round(newVal / step) * step
      }
      onChange(newVal)
    },
    [denormalize, onChange, step]
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (defaultVal !== undefined) {
        onChange(defaultVal)
      }
    },
    [defaultVal, onChange]
  )

  const formatValue = (v: number): string => {
    if (step && step >= 1) {
      const shapes = ['Sin', 'Tri', 'Sqr', 'Saw', 'S&H']
      if (label === 'Shape' && v >= 0 && v <= 4) return shapes[Math.round(v)]
      return v.toFixed(0)
    }
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    if (v >= 100) return v.toFixed(0)
    if (v >= 10) return v.toFixed(1)
    if (v >= 1) return v.toFixed(2)
    return v.toFixed(3)
  }

  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2

  // Indicator line
  const rad = (angle * Math.PI) / 180
  const x2 = cx + Math.sin(rad) * (r - 3)
  const y2 = cy - Math.cos(rad) * (r - 3)
  const x1 = cx + Math.sin(rad) * (r * 0.45)
  const y1 = cy - Math.cos(rad) * (r * 0.45)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        userSelect: 'none',
        cursor: 'ns-resize',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track arc */}
        <circle cx={cx} cy={cy} r={r} fill="#1a1a1a" stroke="#333" strokeWidth={2} />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 1}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={`${normalized * 2 * Math.PI * (r - 1) * (ARC_RANGE / 360)} ${2 * Math.PI * (r - 1)}`}
          strokeDashoffset={0}
          transform={`rotate(${ARC_START}, ${cx}, ${cy})`}
          opacity={0.3}
        />
        {/* Indicator line */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill="#222" stroke="#444" strokeWidth={1} />
      </svg>
      <div style={{ fontSize: 9, color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>
        {formatValue(value)}{unit ? ` ${unit}` : ''}
      </div>
    </div>
  )
}
