import { create } from 'zustand';
import { ShapeType, ParticleConfig } from './types';

interface AppState {
  config: ParticleConfig;
  setConfig: (update: Partial<ParticleConfig>) => void;
  
  // Transient state for the animation loop (avoiding React renders)
  // We use a mutable object for high-frequency updates
  gestureState: {
    expansion: number; // 0 to 1 target
    currentExpansion: number; // smoothed
    handsPresent: boolean;
  };
  
  setExpansion: (val: number, present: boolean) => void;
  
  uiVisible: boolean;
  toggleUI: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  config: {
    color: '#00ffff',
    size: 0.15,
    count: 6000,
    shape: ShapeType.HEART,
  },
  setConfig: (update) => set((state) => ({ config: { ...state.config, ...update } })),
  
  gestureState: {
    expansion: 0,
    currentExpansion: 0,
    handsPresent: false,
  },
  
  setExpansion: (val, present) => {
    // Direct mutation for performance in the loop, 
    // but we can also use set if we needed reactivity (we usually don't for 60fps physics)
    const state = get();
    state.gestureState.expansion = val;
    state.gestureState.handsPresent = present;
  },

  uiVisible: true,
  toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
}));
