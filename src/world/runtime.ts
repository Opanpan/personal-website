import { SPAWN } from './config';

/**
 * Mutable per-frame state shared between the scene and the DOM UI.
 * Never put this in React state — it changes every frame.
 */
export const runtime = {
  player: { x: SPAWN.x, z: SPAWN.z, y: 0, heading: 0 },
  moving: false,
  keys: { up: false, down: false, left: false, right: false, run: false },
  /** virtual joystick, -1..1 on both axes (y = forward) */
  joy: { x: 0, y: 0 },
  /** click/tap-to-move destination */
  target: null as { x: number; z: number } | null,
  /** interactable to open once the player reaches the target */
  pendingOpen: null as string | null,
  /** set to teleport the player on the next frame */
  teleport: null as { x: number; z: number } | null,
  zoom: 1,
  /** camera orbit around the player, driven by mouse/touch drag. yaw 0 = camera south of the player */
  camYaw: 0,
  camPitch: 0.85,
  /** smoothed yaw actually used this frame (movement + occlusion read this) */
  viewYaw: 0,
  /** true once the current pointer press has moved far enough to count as a drag, not a click */
  dragged: false,
  /** jump: height above the ground and vertical speed; `jumpQueued` is set by input */
  jumpY: 0,
  jumpV: 0,
  jumpQueued: false,
  /** current emote and when it started (performance.now() seconds) */
  emote: null as { kind: Emote; since: number } | null,
  /** last wave (by the player, or a bowl ring at the bakso cart): nearby villagers wave back */
  wave: null as { at: number; x: number; z: number } | null,
  /** prop animation triggers, performance.now() seconds */
  gongAt: -100,
  swingAt: -100,
  baksoAt: -100,
};

export type Emote = 'wave' | 'dance' | 'sit';

/** Seconds clock shared by DOM handlers and frame loops. */
export const now = () => performance.now() / 1000;

export function clearMovement() {
  runtime.target = null;
  runtime.pendingOpen = null;
  runtime.joy.x = 0;
  runtime.joy.y = 0;
  const k = runtime.keys;
  k.up = k.down = k.left = k.right = k.run = false;
  runtime.jumpQueued = false;
}
