import { BAKSO_CART, PropSpot, propSpots, TORCHES } from './config';
import { Emote, now, runtime } from './runtime';
import { getState, setState } from './store';
import { audio } from './audio';

/** Use an interactive prop: plays its sound and kicks off its animation. */
export function activateProp(id: string) {
  const prop = propSpots.find((p) => p.id === id);
  if (!prop) return;
  audio.init();
  const t = now();
  switch (prop.kind) {
    case 'gong':
      runtime.gongAt = t;
      audio.gong();
      break;
    case 'swing':
      runtime.swingAt = t;
      audio.creak();
      break;
    case 'bakso':
      runtime.baksoAt = t;
      audio.ting();
      // Mang Ujang (and anyone nearby) waves at the sound of the bowl
      runtime.wave = { at: t, x: BAKSO_CART.x, z: BAKSO_CART.z };
      break;
  }
}

export const propById = (id: string | null): PropSpot | undefined => propSpots.find((p) => p.id === id);

/** Click a torch to put it out or light it again (only when standing close enough). */
export function toggleTorch(index: number) {
  const s = getState();
  if (!s.started || s.panel || runtime.dragged) return;
  const torch = TORCHES[index];
  if (Math.hypot(torch.x - runtime.player.x, torch.z - runtime.player.z) > 7) return;
  audio.init();
  const unlit = s.unlitTorches.includes(index);
  setState({ unlitTorches: unlit ? s.unlitTorches.filter((i) => i !== index) : [...s.unlitTorches, index] });
  audio.torch(unlit);
}

/** Emotes: toggling the same one again stops it (except wave, which just replays). */
export function doEmote(kind: Emote) {
  const s = getState();
  if (!s.started || s.panel || s.mapOpen) return;
  audio.init();
  if (runtime.emote?.kind === kind && kind !== 'wave') {
    runtime.emote = null;
    return;
  }
  runtime.emote = { kind, since: now() };
  // stop click-to-move so sitting/dancing doesn't get cancelled immediately
  runtime.target = null;
  runtime.pendingOpen = null;
  if (kind === 'wave') {
    runtime.wave = { at: now(), x: runtime.player.x, z: runtime.player.z };
    audio.blip(1.15);
  }
}

export function jump() {
  const s = getState();
  if (!s.started || s.panel || s.mapOpen) return;
  audio.init();
  runtime.jumpQueued = true;
}

/** E / Enter / prompt tap: story marker first, otherwise the nearby prop. */
export function interact() {
  const s = getState();
  if (!s.started || s.panel || s.mapOpen) return false;
  if (s.nearby) {
    setState({ panel: s.nearby });
    return true;
  }
  if (s.nearbyProp) {
    activateProp(s.nearbyProp);
    return true;
  }
  return false;
}
