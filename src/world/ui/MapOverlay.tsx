import React from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { interactables, ISLAND_RADIUS, LAND_RADIUS, PATHS, PIER, QUEST_GROUPS, QuestGroup, TRAVEL_POINTS } from '../config';
import { clearMovement, runtime } from '../runtime';
import { setState, useGame } from '../store';

const ICONS: Record<QuestGroup, string> = {
  welcome: '🗼',
  about: '🏠',
  experience: '🛕',
  projects: '🏪',
  skills: '🌾',
  quote: '🌳',
  contact: '⛵',
};

export function travelTo(group: QuestGroup) {
  clearMovement();
  runtime.teleport = { ...TRAVEL_POINTS[group] };
  setState({ mapOpen: false, panel: null, questOpen: false });
}

export default function MapOverlay() {
  const { t } = useTranslation('common');
  const open = useGame((s) => s.mapOpen);
  const visited = useGame((s) => s.visited);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center p-3 md:p-8 bg-black/60 backdrop-blur-sm"
          onClick={() => setState({ mapOpen: false })}
        >
          <m.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="rpg-panel w-full max-w-4xl max-h-[92vh] overflow-y-auto p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{t('world.map_title')}</h2>
                <p className="text-xs text-white/60">{t('world.map_hint')}</p>
              </div>
              <button onClick={() => setState({ mapOpen: false })} className="rpg-icon-button" aria-label={t('world.close')}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_17rem] gap-5">
              <svg viewBox="-64 -64 128 142" className="w-full max-h-[60vh] rounded-2xl bg-[#1d7fae]">
                <circle r={ISLAND_RADIUS} fill="#f1dca4" />
                <circle r={LAND_RADIUS - 1} fill="#79c25a" />
                {PATHS.map(([ax, az, bx, bz], i) => (
                  <line key={i} x1={ax} y1={az} x2={bx} y2={bz} stroke="#d8b685" strokeWidth={2.8} strokeLinecap="round" />
                ))}
                <rect x={-PIER.halfWidth} y={PIER.start} width={PIER.halfWidth * 2} height={PIER.end - PIER.start} fill="#b98550" />
                {interactables.map((it) => (
                  <circle key={it.id} cx={it.x} cy={it.z} r={1.1} fill={visited.includes(it.id) ? '#4ade80' : '#f2c94c'} />
                ))}
                {QUEST_GROUPS.map((g) => {
                  const p = TRAVEL_POINTS[g];
                  return (
                    <g key={g} transform={`translate(${p.x} ${p.z - 4})`} className="cursor-pointer" onClick={() => travelTo(g)}>
                      <circle r={5.5} fill="rgba(0,0,0,0.45)" stroke="#f2c94c" strokeWidth={0.6} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={6}>
                        {ICONS[g]}
                      </text>
                      <text y={8.5} textAnchor="middle" fontSize={3.4} fill="#fff" fontWeight={700} style={{ paintOrder: 'stroke' }} stroke="#000" strokeWidth={0.6}>
                        {t(`world.places.${g}.name`)}
                      </text>
                    </g>
                  );
                })}
                <circle cx={runtime.player.x} cy={runtime.player.z} r={1.8} fill="#fff" stroke="#111" strokeWidth={0.5} />
              </svg>
              <ul className="space-y-2">
                {QUEST_GROUPS.map((g) => {
                  const items = interactables.filter((i) => i.group === g);
                  const done = items.filter((i) => visited.includes(i.id)).length;
                  return (
                    <li key={g}>
                      <button onClick={() => travelTo(g)} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-left transition">
                        <span className="text-xl">{ICONS[g]}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-white">{t(`world.places.${g}.name`)}</span>
                          <span className="block text-[11px] text-white/55 truncate">{t(`world.places.${g}.sub`)}</span>
                        </span>
                        {done === items.length ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <span className="text-xs font-mono text-amber-300/80">
                            {done}/{items.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
