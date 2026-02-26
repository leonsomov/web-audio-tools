import { useEffect } from 'react'
import { SynthGraph } from './graph/SynthGraph'
import { Toolbar } from './toolbar/Toolbar'
import { useGraphStore } from './graph/useGraphStore'
import { DEFAULT_PATCH } from './patches/defaultPatch'
import './theme/tokens.css'

function App() {
  const loadPatch = useGraphStore((s) => s.loadPatch)
  const nodes = useGraphStore((s) => s.nodes)

  useEffect(() => {
    // Load saved patch or default
    const raw = localStorage.getItem('geeky-synth-patch')
    if (raw) {
      try {
        loadPatch(JSON.parse(raw))
      } catch {
        loadPatch(DEFAULT_PATCH)
      }
    } else {
      loadPatch(DEFAULT_PATCH)
    }
  }, [])

  // Auto-save on changes
  useEffect(() => {
    if (nodes.length === 0) return
    const timeout = setTimeout(() => {
      useGraphStore.getState().savePatch()
    }, 1000)
    return () => clearTimeout(timeout)
  }, [nodes])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <div style={{ flex: 1, marginTop: 44 }}>
        <SynthGraph />
      </div>
    </div>
  )
}

export default App
