/**
 * ModulePalette — dropdown grid of available modules.
 */

import { useGraphStore } from '../graph/useGraphStore'
import { MODULE_LIST } from '../modules'

interface ModulePaletteProps {
  onClose: () => void
}

export function ModulePalette({ onClose }: ModulePaletteProps) {
  const addModule = useGraphStore((s) => s.addModule)

  const handleAdd = (type: string) => {
    addModule(type)
    onClose()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 6,
        padding: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        minWidth: 280,
        zIndex: 200,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      {MODULE_LIST.map((def) => (
        <button
          key={def.type}
          onClick={() => handleAdd(def.type)}
          style={{
            background: `${def.color}12`,
            border: `1px solid ${def.color}33`,
            color: def.color,
            borderRadius: 4,
            padding: '8px 6px',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
            fontFamily: "'Avenir Next Condensed', 'Arial Narrow', Arial, sans-serif",
            textAlign: 'center',
          }}
        >
          {def.label}
          <div style={{ fontSize: 9, color: '#666', marginTop: 2, fontWeight: 400 }}>
            {def.category}
          </div>
        </button>
      ))}
    </div>
  )
}
