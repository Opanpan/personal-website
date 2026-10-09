import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import World from './scene/World';
import HUD from './ui/HUD';
import Intro from './ui/Intro';
import Panel from './ui/Panel';
import MapOverlay from './ui/MapOverlay';
import Joystick from './ui/Joystick';
import { interactables } from './config';
import { clearMovement, runtime } from './runtime';
import { getState, initQuality, initVisited, markVisited, setState, useGame } from './store';
import { PerformanceMonitor } from '@react-three/drei';
import { interactableTitle } from './ui/text';
import { audio } from './audio';
import TourBar from './ui/TourBar';
import { TOUR_ORDER } from './tour';
import { doEmote, interact, jump } from './props';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const KEYMAP: Record<string, keyof typeof runtime.keys> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
};

function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const s = getState();
      const k = KEYMAP[e.code];
      if (k) {
        runtime.keys[k] = true;
        if (k !== 'run') e.preventDefault();
        return;
      }
      if (!s.started) {
        if (e.code === 'Enter' && s.ready) {
          audio.init();
          setState({ started: true });
        }
        return;
      }
      switch (e.code) {
        case 'KeyE':
        case 'Enter':
          if (s.panel || s.mapOpen) return;
          if (interact()) e.preventDefault();
          break;
        case 'Space':
          if (s.panel || s.mapOpen || e.repeat) return;
          e.preventDefault();
          jump();
          break;
        case 'Digit1':
        case 'Numpad1':
          doEmote('wave');
          break;
        case 'Digit2':
        case 'Numpad2':
          doEmote('dance');
          break;
        case 'Digit3':
        case 'Numpad3':
          doEmote('sit');
          break;
        case 'Escape':
          setState({ panel: null, mapOpen: false, questOpen: false, menuOpen: false });
          break;
        case 'KeyM':
          if (!s.panel) setState({ mapOpen: !s.mapOpen });
          break;
        case 'KeyQ':
          if (!s.panel) setState({ questOpen: !s.questOpen });
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYMAP[e.code];
      if (k) runtime.keys[k] = false;
    };
    const blur = () => clearMovement();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);
}

/**
 * Shaders compile on the first rendered frames (a noticeable hitch on integrated GPUs),
 * so only let the player start once a few frames have actually been drawn.
 */
function ReadyAfterFirstFrames() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) setState({ ready: true });
  });
  return null;
}

const DRAG_THRESHOLD = 6;

/**
 * Drag on the 3D view (any mouse button, or one finger) to orbit the camera around the player.
 * Two fingers pinch to zoom. A press that never passes the threshold stays a normal click.
 */
function useCameraDrag(root: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let travelled = 0;
    let pinch = 0;

    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        travelled = 0;
        runtime.dragged = false;
      }
      if (pointers.size === 2) {
        const [a, b] = Array.from(pointers.values());
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = Array.from(pointers.values());
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) runtime.zoom = Math.min(1.6, Math.max(0.6, runtime.zoom * (pinch / d)));
        pinch = d;
        runtime.dragged = true;
        return;
      }
      travelled += Math.abs(dx) + Math.abs(dy);
      if (travelled < DRAG_THRESHOLD) return;
      if (!runtime.dragged) {
        runtime.dragged = true;
        el.style.cursor = 'grabbing';
      }
      runtime.camYaw -= dx * 0.006;
      runtime.camPitch = Math.min(1.35, Math.max(0.2, runtime.camPitch + dy * 0.004));
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (pointers.size === 0) el.style.cursor = '';
    };
    const noMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLCanvasElement) e.preventDefault();
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    el.addEventListener('contextmenu', noMenu);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('contextmenu', noMenu);
    };
  }, [root]);
}

export default function Game() {
  const { t } = useTranslation('common');
  const { theme, setTheme } = useTheme();
  const night = theme === 'dark';

  // dev-only handle for the scripted promo recorder (promo/); stripped from production builds
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as unknown as { __world: unknown }).__world = { runtime, getState, setState, setTheme };
  }, [setTheme]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [touch, setTouch] = useState(false);
  const panel = useGame((s) => s.panel);
  const quality = useGame((s) => s.quality);
  const fading = useGame((s) => s.fading);

  useEffect(() => {
    audio.setNight(night);
  }, [night]);

  const root = useRef<HTMLDivElement>(null);

  useKeyboard();
  useCameraDrag(root);

  useEffect(() => {
    setSupported(hasWebGL());
    // touch layout (joystick, big buttons) on touch screens and on narrow viewports
    const mq = window.matchMedia('(any-pointer: coarse), (max-width: 767px)');
    const onTouchChange = () => setTouch(mq.matches);
    onTouchChange();
    mq.addEventListener('change', onTouchChange);
    initVisited();
    initQuality();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      mq.removeEventListener('change', onTouchChange);
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Opening a panel counts as discovering that place
  useEffect(() => {
    if (!panel) return;
    clearMovement();
    const it = interactables.find((i) => i.id === panel);
    if (!it) return;
    const { tour } = getState();
    if (tour.active && TOUR_ORDER[tour.index] === panel) setState({ tour: { ...tour, seen: true } });
    const isNew = markVisited(it.id, t('world.discovered', { name: interactableTitle(it, t) }));
    if (isNew) audio.discover();
    else audio.page();
  }, [panel, t]);

  const onWheel = (e: React.WheelEvent) => {
    runtime.zoom = Math.min(1.6, Math.max(0.6, runtime.zoom + e.deltaY * 0.001));
  };

  if (supported === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-[var(--bg-primary)]">
        <p className="text-lg text-[var(--text-secondary)] max-w-md">{t('world.no_webgl')}</p>
        <Link href="/classic" className="btn-primary">
          <span className="relative z-10">{t('world.classic')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={root} className="world-root fixed inset-0 overflow-hidden select-none" onWheel={onWheel}>
      {supported && (
        <Canvas
          shadows
          dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
          camera={{ fov: 45, near: 0.5, far: 700, position: [60, 42, 60] }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ touchAction: 'none' }}
        >
          {/* step down to the low tier if the frame rate stays poor (unless the player chose a tier) */}
          <PerformanceMonitor
            bounds={() => [28, 55]}
            flipflops={2}
            onDecline={() => !getState().qualityLocked && setState({ quality: 'low' })}
            onFallback={() => !getState().qualityLocked && setState({ quality: 'low' })}
          />
          <World night={night} quality={quality} />
          <ReadyAfterFirstFrames />
        </Canvas>
      )}
      <HUD touch={touch} />
      <TourBar />
      {/* fade-to-black used by the guided tour between distant stops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[#09090b] transition-opacity duration-300 motion-reduce:duration-0"
        style={{ opacity: fading ? 1 : 0 }}
      />
      {touch && <Joystick />}
      <Panel />
      <MapOverlay />
      <Intro touch={touch} />
    </div>
  );
}
