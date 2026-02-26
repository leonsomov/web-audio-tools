/**
 * Toolbar — top bar with audio start, module palette, and patch controls.
 */

import { useState } from 'react'
import { useGraphStore } from '../graph/useGraphStore'
import { ModulePalette } from './ModulePalette'

export function Toolbar() {
  const audioReady = useGraphStore((s) => s.audioReady)
  const initAudio = useGraphStore((s) => s.initAudio)
  const savePatch = useGraphStore((s) => s.savePatch)
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        background: '#111',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 8,
        zIndex: 100,
        fontFamily: "'Avenir Next Condensed', 'Arial Narrow', Arial, sans-serif",
      }}
    >
      {/* Logo / Title */}
      <span
        style={{
          color: '#E3C330',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: '2px',
          marginRight: 16,
        }}
      >
        GEEKY SYNTH
      </span>

      {/* Start Audio */}
      {!audioReady && (
        <button onClick={initAudio} style={btnStyle('#E3C330')}>
          Start Audio
        </button>
      )}
      {audioReady && (
        <span style={{ color: '#5DBE6E', fontSize: 11, letterSpacing: '1px' }}>
          AUDIO ON
        </span>
      )}

      <div style={{ width: 1, height: 24, background: '#333', margin: '0 8px' }} />

      {/* Add Module */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setPaletteOpen(!paletteOpen)}
          style={btnStyle('#f0f0ef')}
        >
          + Add Module
        </button>
        {paletteOpen && (
          <ModulePalette onClose={() => setPaletteOpen(false)} />
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Patch controls */}
      <button onClick={savePatch} style={btnStyle('#888')}>
        Save
      </button>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: 'none',
    border: `1px solid ${color}55`,
    color,
    padding: '5px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.5px',
    fontFamily: 'inherit',
  }
}
