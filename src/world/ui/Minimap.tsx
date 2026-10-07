import React, { useEffect, useRef } from 'react';
import { interactables, ISLAND_RADIUS, LAND_RADIUS, PATHS, PIER } from '../config';
import { runtime } from '../runtime';
import { getState, setState } from '../store';

const SIZE = 150;
const RANGE = 78; // world units shown across the minimap

/** Canvas minimap redrawn every animation frame from the shared runtime state. */
export default function Minimap() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = SIZE * dpr;
    c.height = SIZE * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    let raf = 0;
    const k = SIZE / RANGE;

    const draw = () => {
      const p = runtime.player;
      const visited = getState().visited;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#1d7fae';
      ctx.fillRect(0, 0, SIZE, SIZE);
      // world → minimap, centred on the player
      ctx.translate(SIZE / 2 - p.x * k, SIZE / 2 - p.z * k);
      ctx.fillStyle = '#f1dca4';
      ctx.beginPath();
      ctx.arc(0, 0, ISLAND_RADIUS * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#79c25a';
      ctx.beginPath();
      ctx.arc(0, 0, (LAND_RADIUS - 1) * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d8b685';
      ctx.lineWidth = 2.8 * k;
      ctx.lineCap = 'round';
      PATHS.forEach(([ax, az, bx, bz]) => {
        ctx.beginPath();
        ctx.moveTo(ax * k, az * k);
        ctx.lineTo(bx * k, bz * k);
        ctx.stroke();
      });
      ctx.fillStyle = '#b98550';
      ctx.fillRect(-PIER.halfWidth * k, PIER.start * k, PIER.halfWidth * 2 * k, (PIER.end - PIER.start) * k);
      interactables.forEach((it) => {
        ctx.fillStyle = visited.includes(it.id) ? '#4ade80' : '#f2c94c';
        ctx.beginPath();
        ctx.arc(it.x * k, it.z * k, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      // player arrow
      ctx.translate(p.x * k, p.z * k);
      ctx.rotate(-p.heading + Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4.5, 5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-4.5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button onClick={() => setState({ mapOpen: true })} className="rpg-minimap" aria-label="Map">
      <canvas ref={canvas} style={{ width: SIZE, height: SIZE }} />
      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/90 drop-shadow">N</span>
    </button>
  );
}
