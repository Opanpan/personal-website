import { interactables, TRAVEL_POINTS } from './config';
import { clearMovement, runtime } from './runtime';
import { getState, setState } from './store';
import { audio } from './audio';

/**
 * Guided tour: walks the player to every stop in story order and opens its panel.
 * Long hops fade to black and drop the player a few steps away, so they still walk in.
 */
export const TOUR_ORDER = [
  'welcome',
  'about',
  'exp_jojonomic',
  'exp_lawencon',
  'exp_pcs',
  'education',
  ...interactables.filter((i) => i.kind === 'project').map((i) => i.id),
  'skills',
  'quote',
  'contact',
];

const WALK_IN = 3.5; // how far from a stop the fade drops you
const FADE_MS = 280;
let timers: ReturnType<typeof setTimeout>[] = [];

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function walkTo(id: string) {
  const it = interactables.find((i) => i.id === id)!;
  runtime.target = { x: it.x, z: it.z };
  runtime.pendingOpen = id;
}

export function goToStop(index: number) {
  clearTimers();
  const id = TOUR_ORDER[index];
  const it = interactables.find((i) => i.id === id);
  if (!it) return endTour();
  clearMovement();
  setState({ panel: null, mapOpen: false, questOpen: false, menuOpen: false, tour: { active: true, index, seen: false } });

  const p = runtime.player;
  if (Math.hypot(it.x - p.x, it.z - p.z) < 7) {
    walkTo(id);
  } else {
    // drop in a few steps away, on the side facing this area's open ground
    const anchor = TRAVEL_POINTS[it.group];
    let dx = anchor.x - it.x;
    let dz = anchor.z - it.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.5) {
      dx = -it.x;
      dz = -it.z;
    }
    const k = WALK_IN / (Math.hypot(dx, dz) || 1);
    setState({ fading: true });
    later(() => {
      runtime.teleport = { x: it.x + dx * k, z: it.z + dz * k };
      setState({ fading: false });
      later(() => walkTo(id), 60);
    }, FADE_MS);
  }

  // safety net: if the walk gets blocked, pop the player there and open it anyway
  later(() => {
    const s = getState();
    if (s.tour.active && s.tour.index === index && s.panel !== id) {
      runtime.teleport = { x: it.x, z: it.z };
      later(() => {
        if (getState().tour.index === index) setState({ panel: id });
      }, 80);
    }
  }, 6500);
}

export function startTour() {
  audio.init();
  setState({ started: true });
  goToStop(0);
}

/** Resume after the player closed a panel or wandered off: next stop if this one was read. */
export function continueTour() {
  const { tour } = getState();
  if (tour.seen) nextStop();
  else goToStop(tour.index);
}

export function nextStop() {
  const i = getState().tour.index + 1;
  if (i >= TOUR_ORDER.length) endTour();
  else goToStop(i);
}

export function endTour() {
  clearTimers();
  runtime.target = null;
  runtime.pendingOpen = null;
  setState({ tour: { active: false, index: 0, seen: false }, fading: false });
}
