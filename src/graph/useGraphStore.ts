/**
 * Zustand store — single source of truth for graph + audio state.
 *
 * React Flow nodes/edges sync ↔ AudioEngine connections.
 */

import { create } from 'zustand'
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection as RFConnection,
} from '@xyflow/react'
import { audioEngine } from '../engine/AudioEngine'
import { MODULE_REGISTRY } from '../modules'
import type { PatchState } from '../types/audio'

export interface ModuleNodeData {
  moduleType: string
  label: string
  color: string
  params: Record<string, number>
  [key: string]: unknown
}

export type ModuleNode = Node<ModuleNodeData>

let nodeCounter = 0

interface GraphState {
  nodes: ModuleNode[]
  edges: Edge[]
  audioReady: boolean

  // Actions
  initAudio: () => Promise<void>
  addModule: (type: string, position?: { x: number; y: number }) => void
  removeModule: (nodeId: string) => void
  onNodesChange: OnNodesChange<ModuleNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setParam: (nodeId: string, paramId: string, value: number) => void
  savePatch: () => void
  loadPatch: (patch?: PatchState) => void
  loadFromLocalStorage: () => void
}

const STORAGE_KEY = 'geeky-synth-patch'

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  audioReady: false,

  initAudio: async () => {
    await audioEngine.init()
    set({ audioReady: true })

    // Recreate audio nodes for any existing graph nodes
    const { nodes } = get()
    for (const node of nodes) {
      audioEngine.createNode(node.id, node.data.moduleType)
    }
    // Recreate connections
    const { edges } = get()
    for (const edge of edges) {
      if (edge.sourceHandle && edge.targetHandle) {
        audioEngine.connect(
          { moduleId: edge.source, portId: edge.sourceHandle },
          { moduleId: edge.target, portId: edge.targetHandle }
        )
      }
    }
  },

  addModule: (type, position) => {
    const definition = MODULE_REGISTRY[type]
    if (!definition) return

    const id = `${type}_${++nodeCounter}`
    const defaultParams: Record<string, number> = {}
    for (const p of definition.params) {
      defaultParams[p.id] = p.default
    }

    const newNode: ModuleNode = {
      id,
      type: 'synthModule',
      position: position ?? { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
      data: {
        moduleType: type,
        label: definition.label,
        color: definition.color,
        params: defaultParams,
      },
    }

    set((state) => ({ nodes: [...state.nodes, newNode] }))

    if (get().audioReady) {
      audioEngine.createNode(id, type)
    }
  },

  removeModule: (nodeId) => {
    audioEngine.removeNode(nodeId)
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }))
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }))
  },

  onEdgesChange: (changes) => {
    // Handle edge removals → disconnect audio
    for (const change of changes) {
      if (change.type === 'remove') {
        const edge = get().edges.find((e) => e.id === change.id)
        if (edge && edge.sourceHandle && edge.targetHandle) {
          audioEngine.disconnect(
            { moduleId: edge.source, portId: edge.sourceHandle },
            { moduleId: edge.target, portId: edge.targetHandle }
          )
        }
      }
    }
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }))
  },

  onConnect: (connection: RFConnection) => {
    if (!connection.sourceHandle || !connection.targetHandle) return

    const edgeId = `${connection.source}.${connection.sourceHandle}->${connection.target}.${connection.targetHandle}`
    const newEdge: Edge = {
      id: edgeId,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'patchCable',
    }

    set((state) => ({ edges: [...state.edges, newEdge] }))

    if (get().audioReady) {
      audioEngine.connect(
        { moduleId: connection.source, portId: connection.sourceHandle },
        { moduleId: connection.target, portId: connection.targetHandle }
      )
    }
  },

  setParam: (nodeId, paramId, value) => {
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n
        return {
          ...n,
          data: {
            ...n.data,
            params: { ...n.data.params, [paramId]: value },
          },
        }
      }),
    }))

    audioEngine.setParam(nodeId, paramId, value)
  },

  savePatch: () => {
    const { nodes, edges } = get()
    const patch: PatchState = {
      version: 1,
      name: 'Untitled',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.moduleType,
        position: n.position,
        params: n.data.params,
      })),
      connections: edges
        .filter((e) => e.sourceHandle && e.targetHandle)
        .map((e) => ({
          id: e.id,
          from: { moduleId: e.source, portId: e.sourceHandle! },
          to: { moduleId: e.target, portId: e.targetHandle! },
          signalType: 'audio' as const,
        })),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patch))
  },

  loadPatch: (patch) => {
    if (!patch) return

    // Clear existing
    const { nodes: existingNodes } = get()
    for (const n of existingNodes) {
      audioEngine.removeNode(n.id)
    }

    // Restore counter
    let maxNum = 0
    for (const n of patch.nodes) {
      const match = n.id.match(/_(\d+)$/)
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]))
    }
    nodeCounter = maxNum

    const newNodes: ModuleNode[] = patch.nodes.map((n) => {
      const def = MODULE_REGISTRY[n.type]
      return {
        id: n.id,
        type: 'synthModule',
        position: n.position,
        data: {
          moduleType: n.type,
          label: def?.label ?? n.type,
          color: def?.color ?? '#888',
          params: n.params,
        },
      }
    })

    const newEdges: Edge[] = patch.connections.map((c) => ({
      id: c.id,
      source: c.from.moduleId,
      target: c.to.moduleId,
      sourceHandle: c.from.portId,
      targetHandle: c.to.portId,
      type: 'patchCable',
    }))

    set({ nodes: newNodes, edges: newEdges })

    // Recreate audio if ready
    if (get().audioReady) {
      for (const n of patch.nodes) {
        const entry = audioEngine.createNode(n.id, n.type)
        if (entry) {
          for (const [paramId, value] of Object.entries(n.params)) {
            audioEngine.setParam(n.id, paramId, value)
          }
        }
      }
      for (const c of patch.connections) {
        audioEngine.connect(c.from, c.to)
      }
    }
  },

  loadFromLocalStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const patch = JSON.parse(raw) as PatchState
        get().loadPatch(patch)
      } catch (e) {
        console.error('[Store] Failed to load patch:', e)
      }
    }
  },
}))
