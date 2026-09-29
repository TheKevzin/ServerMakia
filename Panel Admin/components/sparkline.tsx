'use client'

import { cn } from '@/lib/utils'
import { useId } from 'react'

/**
 * Calculates a smooth cubic Bezier spline path through points
 * with Catmull-Rom style tangent interpolation.
 */
function getSmoothSplinePath(points: readonly [number, number][]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`

  let path = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const tension = 0.22
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }

  return path
}

export function Sparkline({
  data,
  color = 'var(--neon)',
  className,
  minVal,
  maxVal,
}: {
  data: number[]
  color?: string
  className?: string
  minVal?: number
  maxVal?: number
}) {
  const id = useId()
  const width = 240
  const height = 64

  // Stable scale calculations
  const safeData = data.length > 0 ? data : [0]
  const min = minVal !== undefined ? minVal : Math.min(...safeData)
  const max = maxVal !== undefined ? maxVal : Math.max(...safeData)
  const range = max - min > 0.001 ? max - min : 1

  const points = safeData.map((v, i) => {
    const x = safeData.length > 1 ? (i / (safeData.length - 1)) * width : width
    const clampedV = Math.max(min, Math.min(max, v))
    const y = height - ((clampedV - min) / range) * (height - 14) - 7
    return [x, y] as const
  })

  const linePath = getSmoothSplinePath(points)
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`
  const [lastX, lastY] = points[points.length - 1] || [width, height / 2]

  return (
    <div className={cn('relative h-16 w-full overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="65%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${id}`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Horizontal Reference Gridline */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.07"
          strokeDasharray="3 3"
        />

        {/* Smooth Area Gradient */}
        <path
          d={areaPath}
          fill={`url(#fill-${id})`}
          className="transition-[d] duration-700 ease-out"
        />

        {/* Smooth Spline Curve */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${id})`}
          className="transition-[d] duration-700 ease-out"
        />

        {/* Tip Halo */}
        <circle
          cx={lastX}
          cy={lastY}
          r="5"
          fill={color}
          opacity="0.25"
          className="transition-[cx,cy] duration-700 ease-out animate-pulse"
        />

        {/* Live Active Tip Dot */}
        <circle
          cx={lastX}
          cy={lastY}
          r="3"
          fill={color}
          filter={`url(#glow-${id})`}
          className="transition-[cx,cy] duration-700 ease-out shadow-[0_0_8px_currentColor]"
        />
      </svg>
    </div>
  )
}
