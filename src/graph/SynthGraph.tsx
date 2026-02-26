/**
 * SynthGraph — React Flow canvas for the modular synth.
 */

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useGraphStore } from './useGraphStore'
import { SynthModuleNode } from '../nodes/SynthModuleNode'
import { PatchCable } from '../edges/PatchCable'

const nodeTypes = {
  synthModule: SynthModuleNode,
}

const edgeTypes = {
  patchCable: PatchCable,
}

export function SynthGraph() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const onNodesChange = useGraphStore((s) => s.onNodesChange)
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange)
  const onConnect = useGraphStore((s) => s.onConnect)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'patchCable' }}
        style={{ background: '#0a0a0a' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a1a" />
        <Controls position="bottom-left" style={{ background: '#1a1a1a', borderColor: '#333' }} />
        <MiniMap
          nodeColor={(n) => (n.data as any)?.color ?? '#333'}
          maskColor="rgba(10, 10, 10, 0.8)"
          style={{ background: '#111' }}
        />
      </ReactFlow>
    </div>
  )
}
