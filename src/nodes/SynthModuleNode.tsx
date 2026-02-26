/**
 * SynthModuleNode — unified React Flow node for all synth modules.
 *
 * Renders header, input/output handles, and parameter knobs
 * based on the ModuleDefinition from the registry.
 */

import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { ModuleNodeData } from '../graph/useGraphStore'
import { useGraphStore } from '../graph/useGraphStore'
import { MODULE_REGISTRY } from '../modules'
import { Knob } from '../controls/Knob'

export const SynthModuleNode = memo(function SynthModuleNode({
  id,
  data,
}: NodeProps & { data: ModuleNodeData }) {
  const setParam = useGraphStore((s) => s.setParam)
  const removeModule = useGraphStore((s) => s.removeModule)

  const definition = MODULE_REGISTRY[data.moduleType]
  if (!definition) return null

  const inputs = definition.inputs
  const outputs = definition.outputs
  const params = definition.params

  const handleParamChange = useCallback(
    (paramId: string, value: number) => {
      setParam(id, paramId, value)
    },
    [id, setParam]
  )

  const handleDelete = useCallback(() => {
    removeModule(id)
  }, [id, removeModule])

  const signalColor = (type: string): string => {
    switch (type) {
      case 'audio': return '#E3C330'
      case 'cv': return '#4A9EDE'
      case 'gate': return '#DE4A4A'
      default: return '#888'
    }
  }

  return (
    <div
      style={{
        background: '#161616',
        border: `1px solid ${data.color}44`,
        borderRadius: 8,
        minWidth: 140,
        fontFamily: "'Avenir Next Condensed', 'Arial Narrow', Arial, sans-serif",
        boxShadow: `0 0 12px ${data.color}11`,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `${data.color}18`,
          borderBottom: `1px solid ${data.color}33`,
          padding: '6px 10px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: data.color, fontWeight: 600, fontSize: 12, letterSpacing: '1px' }}>
          {data.label}
        </span>
        <button
          onClick={handleDelete}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '0 2px',
          }}
          title="Remove module"
        >
          x
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Knobs */}
        {params.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
            }}
          >
            {params.map((p) => (
              <Knob
                key={p.id}
                label={p.name}
                value={data.params[p.id] ?? p.default}
                min={p.min}
                max={p.max}
                default={p.default}
                onChange={(v) => handleParamChange(p.id, v)}
                color={data.color}
                unit={p.unit}
                scaling={p.scaling}
                step={p.step}
                size={44}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input handles (left side) */}
      {inputs.map((port, i) => {
        const topPercent = ((i + 1) / (inputs.length + 1)) * 100
        return (
          <Handle
            key={port.id}
            type="target"
            position={Position.Left}
            id={port.id}
            style={{
              top: `${topPercent}%`,
              width: 10,
              height: 10,
              background: signalColor(port.signalType),
              border: '2px solid #0a0a0a',
            }}
            title={port.name}
          />
        )
      })}

      {/* Output handles (right side) */}
      {outputs.map((port, i) => {
        const topPercent = ((i + 1) / (outputs.length + 1)) * 100
        return (
          <Handle
            key={port.id}
            type="source"
            position={Position.Right}
            id={port.id}
            style={{
              top: `${topPercent}%`,
              width: 10,
              height: 10,
              background: signalColor(port.signalType),
              border: '2px solid #0a0a0a',
            }}
            title={port.name}
          />
        )
      })}

      {/* Port labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 6px 6px',
          fontSize: 8,
          color: '#555',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inputs.map((p) => (
            <span key={p.id}>{p.name}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
          {outputs.map((p) => (
            <span key={p.id}>{p.name}</span>
          ))}
        </div>
      </div>
    </div>
  )
})
