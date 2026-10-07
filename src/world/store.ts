import { useSyncExternalStore } from 'react';
import { interactables } from './config';

/**
 * Tiny external store for UI-level game state (things React should re-render on).
 * Per-frame values (player position, input) live in `runtime.ts` instead.
 */
export type Quality = 'high' | 'low';

export interface GameState {
  /** graphics tier: 'high' adds postprocessing + dense grass */
  quality: Quality;
  /** user picked a tier by hand, so stop auto-adjusting */
  qualityLocked: boolean;
  /** shaders compiled, safe to start rendering */
  ready: boolean;
  started: boolean;
  /** interactable id whose panel is open */
  panel: string | null;
  /** interactable id the player is standing near */
  nearby: string | null;
  visited: string[];
  mapOpen: boolean;
  questOpen: boolean;
  toast: { id: number; text: string } | null;
  completed: boolean;
  /** guided tour progress (index into TOUR_ORDER) */
  tour: { active: boolean; index: number; seen: boolean };
  /** black fade used when the tour jumps between distant stops */
  fading: boolean;
  muted: boolean;
  /** interactive prop the player is standing at (when no story marker is closer) */
  nearbyProp: string | null;
  /** indices into TORCHES the player has put out */
  unlitTorches: number[];
}

const VISITED_KEY = 'world-visited';

function loadVisited(): string[] {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => interactables.some((i) => i.id === id)) : [];
  } catch {
    return [];
  }
}

let state: GameState = {
  quality: 'high',
  qualityLocked: false,
  ready: false,
  started: false,
  panel: null,
  nearby: null,
  visited: [],
  mapOpen: false,
  questOpen: false,
  toast: null,
  completed: false,
  tour: { active: false, index: 0, seen: false },
  fading: false,
  muted: false,
  nearbyProp: null,
  unlitTorches: [],
};

const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
  const next = typeof partial === 'function' ? partial(state) : partial;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGame<T>(selector: (s: GameState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

export function initVisited() {
  const visited = loadVisited();
  setState({ visited, completed: visited.length === interactables.length });
}

/** Returns true when this is a new discovery. */
export function markVisited(id: string, discoveredText: string) {
  if (state.visited.includes(id)) return false;
  const visited = [...state.visited, id];
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  } catch {
    // storage unavailable: progress just won't persist
  }
  setState({ visited, toast: { id: Date.now(), text: discoveredText } });
  if (visited.length === interactables.length) setState({ completed: true });
  return true;
}

const QUALITY_KEY = 'world-quality';

export function initQuality() {
  try {
    const saved = localStorage.getItem(QUALITY_KEY);
    if (saved === 'high' || saved === 'low') {
      setState({ quality: saved, qualityLocked: true });
      return;
    }
  } catch {
    // ignore
  }
  // phones and tablets start on low; desktops start high and step down if they struggle
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  setState({ quality: coarse ? 'low' : 'high' });
}

export function setQualityManual(quality: Quality) {
  try {
    localStorage.setItem(QUALITY_KEY, quality);
  } catch {
    // ignore
  }
  setState({ quality, qualityLocked: true });
}

export function resetProgress() {
  try {
    localStorage.removeItem(VISITED_KEY);
  } catch {
    // ignore
  }
  setState({ visited: [], completed: false });
}
