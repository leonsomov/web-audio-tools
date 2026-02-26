/**
 * PatchCable — custom React Flow edge with signal-type color coding.
 *
 * Gold = audio, Blue = CV, Red = gate.
 */

import { type EdgeProps, getBezierPath } from '@xyflow/react'
import { useGraphStore } from '../graph/useGraphStore'
import { MODULE_REGISTRY } from '../modules'

const SIGNAL_COLORS: Record<string, string> = {
  audio: '#E3C330',
  cv: '#4A9EDE',
  gate: '#DE4A4A',
}

export function PatchCable({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.4,
  })

  // Determine signal color from source port
  let color = SIGNAL_COLORS.audio
  const nodes = useGraphStore.getState().nodes
  const sourceNode = nodes.find((n) => n.id === source)
  if (sourceNode && sourceHandleId) {
    const def = MODULE_REGISTRY[sourceNode.data.moduleType]
    const port = def?.outputs.find((p) => p.id === sourceHandleId)
    if (port) {
      color = SIGNAL_COLORS[port.signalType] ?? SIGNAL_COLORS.audio
    }
  }

  return (
    <>
      {/* Glow effect */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 6 : 4}
        strokeOpacity={0.15}
        style={{ filter: 'blur(3px)' }}
      />
      {/* Cable */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeOpacity={0.8}
        strokeLinecap="round"
      />
    </>
  )
}
