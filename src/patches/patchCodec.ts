import type { PatchState } from '../types/audio'

const STORAGE_KEY = 'geeky-synth-patch'

export function savePatchToStorage(patch: PatchState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patch))
}

export function loadPatchFromStorage(): PatchState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PatchState
  } catch {
    return null
  }
}

export function exportPatchToJSON(patch: PatchState): string {
  return JSON.stringify(patch, null, 2)
}

export function importPatchFromJSON(json: string): PatchState | null {
  try {
    const parsed = JSON.parse(json)
    if (parsed.version && parsed.nodes && parsed.connections) {
      return parsed as PatchState
    }
    return null
  } catch {
    return null
  }
}
