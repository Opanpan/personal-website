import React, { useRef, useState } from 'react';
import { runtime } from '../runtime';
import { useGame } from '../store';

const RADIUS = 48;

/** Virtual thumbstick for touch devices; writes straight into runtime.joy. */
export default function Joystick() {
  const started = useGame((s) => s.started);
  const panel = useGame((s) => s.panel);
  const base = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  if (!started || panel) return null;

  const update = (e: React.PointerEvent) => {
    const rect = base.current!.getBoundingClientRect();
    let x = e.clientX - (rect.left + rect.width / 2);
    let y = e.clientY - (rect.top + rect.height / 2);
    const d = Math.hypot(x, y);
    if (d > RADIUS) {
      x = (x / d) * RADIUS;
      y = (y / d) * RADIUS;
    }
    setKnob({ x, y });
    runtime.joy.x = x / RADIUS;
    runtime.joy.y = -y / RADIUS;
    runtime.target = null;
  };
  const end = () => {
    pointer.current = null;
    setKnob({ x: 0, y: 0 });
    runtime.joy.x = 0;
    runtime.joy.y = 0;
  };

  return (
    <div
      ref={base}
      className="rpg-joystick absolute z-20"
      style={{
        width: RADIUS * 2 + 24,
        height: RADIUS * 2 + 24,
        left: 'calc(1rem + env(safe-area-inset-left))',
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        touchAction: 'none',
      }}
      onPointerDown={(e) => {
        pointer.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => pointer.current === e.pointerId && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="rpg-joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
