import type { PatchState } from '../types/audio'

/**
 * Default patch: VCO → VCF → VCA → Output, Envelope → VCA (CV)
 * Makes sound immediately when audio starts.
 */
export const DEFAULT_PATCH: PatchState = {
  version: 1,
  name: 'Init Patch',
  nodes: [
    {
      id: 'oscillator_1',
      type: 'oscillator',
      position: { x: 80, y: 120 },
      params: { tune: 220, shape: 0.5, fm: 0 },
    },
    {
      id: 'filter_1',
      type: 'filter',
      position: { x: 340, y: 120 },
      params: { cutoff: 2000, resonance: 0.2, cv_amount: 0.5 },
    },
    {
      id: 'vca_1',
      type: 'vca',
      position: { x: 580, y: 120 },
      params: { gain: 0 },
    },
    {
      id: 'envelope_1',
      type: 'envelope',
      position: { x: 340, y: 340 },
      params: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.4 },
    },
    {
      id: 'output_1',
      type: 'output',
      position: { x: 800, y: 120 },
      params: { volume: 0.5 },
    },
  ],
  connections: [
    {
      id: 'oscillator_1.sine_out->filter_1.audio_in',
      from: { moduleId: 'oscillator_1', portId: 'sine_out' },
      to: { moduleId: 'filter_1', portId: 'audio_in' },
      signalType: 'audio',
    },
    {
      id: 'filter_1.vcf_out->vca_1.audio_in',
      from: { moduleId: 'filter_1', portId: 'vcf_out' },
      to: { moduleId: 'vca_1', portId: 'audio_in' },
      signalType: 'audio',
    },
    {
      id: 'vca_1.vca_out->output_1.audio_in',
      from: { moduleId: 'vca_1', portId: 'vca_out' },
      to: { moduleId: 'output_1', portId: 'audio_in' },
      signalType: 'audio',
    },
    {
      id: 'envelope_1.env_out->vca_1.cv_in',
      from: { moduleId: 'envelope_1', portId: 'env_out' },
      to: { moduleId: 'vca_1', portId: 'cv_in' },
      signalType: 'cv',
    },
  ],
}
