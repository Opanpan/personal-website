import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, ScrollText, LayoutList, Check, Sparkles, X, RotateCcw, Hand, Music2, Armchair, ChevronsUp } from 'lucide-react';
import { activateProp, doEmote, jump, propById } from '../props';
import type { Emote } from '../runtime';
import { interactables, QUEST_GROUPS } from '../config';
import { runtime } from '../runtime';
import { resetProgress, setState, useGame } from '../store';
import { IconButton, LanguageToggle, MuteToggle, QualityToggle, ThemeToggle, TourToggle } from './Controls';
import Minimap from './Minimap';
import { interactableTitle } from './text';

function Prompt({ touch }: { touch: boolean }) {
  const { t } = useTranslation('common');
  const nearby = useGame((s) => s.nearby);
  const nearbyProp = useGame((s) => s.nearbyProp);
  const panel = useGame((s) => s.panel);
  const it = interactables.find((i) => i.id === nearby);
  const prop = it ? undefined : propById(nearbyProp);
  const verb = it ? (['welcome', 'about', 'experience'].includes(it.kind) ? 'talk' : it.kind === 'quote' || it.kind === 'education' ? 'read' : 'look') : 'look';
  return (
    <AnimatePresence>
      {it && !panel && (
        <m.button
          key={it.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onClick={() => setState({ panel: it.id })}
          className={`rpg-prompt absolute left-1/2 -translate-x-1/2 ${touch ? 'bottom-10 right-auto' : 'bottom-8'}`}
        >
          {!touch && <kbd className="rpg-key">E</kbd>}
          <span className="text-white/70">{t(`world.prompt.${verb}`)}</span>
          <span className="font-semibold text-white">{interactableTitle(it, t)}</span>
        </m.button>
      )}
      {prop && !panel && (
        <m.button
          key={prop.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onClick={() => activateProp(prop.id)}
          className={`rpg-prompt absolute left-1/2 -translate-x-1/2 ${touch ? 'bottom-10 right-auto' : 'bottom-8'}`}
        >
          {!touch && <kbd className="rpg-key">E</kbd>}
          <span className="font-semibold text-white">{t(`world.props.${prop.kind}`)}</span>
        </m.button>
      )}
    </AnimatePresence>
  );
}

const EMOTES: { kind: Emote; key: string; icon: typeof Hand }[] = [
  { kind: 'wave', key: '1', icon: Hand },
  { kind: 'dance', key: '2', icon: Music2 },
  { kind: 'sit', key: '3', icon: Armchair },
];

/** Emote + jump buttons (keyboard: 1-3, Space). Doubles as the touch controls. */
function EmoteDock({ touch }: { touch: boolean }) {
  const { t } = useTranslation('common');
  const panel = useGame((s) => s.panel);
  if (panel) return null;
  return (
    <div className="absolute bottom-6 right-3 md:right-4 flex items-end gap-2" role="toolbar" aria-label={t('world.emotes.label')}>
      <div className="rpg-chip !p-1.5 flex gap-1.5">
        {EMOTES.map((e) => (
          <button key={e.kind} onClick={() => doEmote(e.kind)} className="rpg-emote" aria-label={t(`world.emotes.${e.kind}`)} title={t(`world.emotes.${e.kind}`)}>
            <e.icon className="h-5 w-5" aria-hidden="true" />
            {!touch && <span className="rpg-emote-key">{e.key}</span>}
          </button>
        ))}
      </div>
      <button onClick={jump} className={`rpg-emote rpg-emote-jump ${touch ? '!h-16 !w-16' : ''}`} aria-label={t('world.emotes.jump')} title={t('world.emotes.jump')}>
        <ChevronsUp className="h-6 w-6" aria-hidden="true" />
        {!touch && <span className="rpg-emote-key">Space</span>}
      </button>
    </div>
  );
}

function Toast() {
  const toast = useGame((s) => s.toast);
  const [visible, setVisible] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setVisible(toast);
    const id = setTimeout(() => setVisible(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key={visible.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rpg-toast absolute top-20 md:top-6 left-1/2 -translate-x-1/2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {visible.text}
        </m.div>
      )}
    </AnimatePresence>
  );
}

function QuestLog() {
  const { t } = useTranslation('common');
  const open = useGame((s) => s.questOpen);
  const visited = useGame((s) => s.visited);
  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rpg-panel absolute top-[5.5rem] left-3 md:left-4 w-[min(20rem,calc(100vw-1.5rem))] p-4 z-20"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-bold text-white">{t('world.quest_title')}</h3>
            <button onClick={() => setState({ questOpen: false })} className="text-white/60 hover:text-white" aria-label={t('world.close')}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {QUEST_GROUPS.map((g) => {
              const items = interactables.filter((i) => i.group === g);
              const done = items.filter((i) => visited.includes(i.id)).length;
              const complete = done === items.length;
              return (
                <li key={g}>
                  <button
                    onClick={() => setState({ mapOpen: true, questOpen: false })}
                    className="w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 hover:bg-white/5"
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${complete ? 'bg-green-500 border-green-400' : 'border-white/30'}`}>
                      {complete && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm ${complete ? 'text-white/50 line-through' : 'text-white'}`}>{t(`world.places.${g}.name`)}</span>
                      <span className="block text-[11px] text-white/50">{t(`world.quests.${g}`)}</span>
                    </span>
                    {items.length > 1 && (
                      <span className="text-xs text-amber-300/80 font-mono">
                        {done}/{items.length}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {visited.length > 0 && (
            <button onClick={resetProgress} className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
              <RotateCcw className="w-3 h-3" />
              {t('world.reset')}
            </button>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}

function Completion() {
  const { t } = useTranslation('common');
  const completed = useGame((s) => s.completed);
  const panel = useGame((s) => s.panel);
  const wasComplete = useRef<boolean | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    // only celebrate when it happens in this session, not on reload
    if (wasComplete.current === false && completed) setShow(true);
    wasComplete.current = completed;
  }, [completed]);
  return (
    <AnimatePresence>
      {show && !panel && (
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="rpg-panel max-w-md p-6 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="font-display text-2xl font-bold text-white">{t('world.complete_title')}</h3>
            <p className="mt-2 text-sm text-white/75">{t('world.complete_text')}</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:fanalriansyah@gmail.com" className="rpg-button rpg-button-primary">
                {t('world.complete_cta')}
              </a>
              <button onClick={() => setShow(false)} className="rpg-button">
                {t('world.keep_exploring')}
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default function HUD({ touch }: { touch: boolean }) {
  const { t } = useTranslation('common');
  const started = useGame((s) => s.started);
  const visited = useGame((s) => s.visited.length);
  const questOpen = useGame((s) => s.questOpen);
  const mapOpen = useGame((s) => s.mapOpen);
  const total = interactables.length;

  if (!started) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 [&>*]:pointer-events-auto">
      {/* top-left: identity + progress */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 rpg-chip">
        <button onClick={() => setState({ questOpen: !questOpen })} className="flex items-center gap-3 text-left" aria-label={t('world.quest_title')}>
          <span className="rpg-avatar">IA</span>
          <span className="min-w-0">
            <span className="block font-display text-sm font-bold text-white leading-tight">{t('hero.name')}</span>
            <span className="flex items-center gap-2 mt-1">
              <span className="block h-1.5 w-20 md:w-28 rounded-full bg-white/15 overflow-hidden">
                <span className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-green-400 transition-all duration-700" style={{ width: `${(visited / total) * 100}%` }} />
              </span>
              <span className="text-[11px] font-mono text-white/70">
                {visited}/{total}
              </span>
            </span>
          </span>
          <ScrollText className="w-4 h-4 text-amber-300 ml-1" />
        </button>
      </div>

      {/* top-right: actions */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <TourToggle />
          <IconButton onClick={() => setState({ mapOpen: !mapOpen })} label={t('world.map_title')} active={mapOpen}>
            <MapIcon className="w-4 h-4" />
          </IconButton>
          <MuteToggle />
          <LanguageToggle />
          <ThemeToggle />
          <QualityToggle />
          <Link href="/classic" className="rpg-icon-button" title={t('world.classic')} aria-label={t('world.classic')}>
            <LayoutList className="w-4 h-4" />
          </Link>
        </div>
        <div className="hidden md:block">
          <Minimap />
        </div>
      </div>

      {/* bottom-left: controls hint (desktop) */}
      {!touch && (
        <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 text-[11px] text-white/80 rpg-hint">
          <span>
            <kbd className="rpg-key">WASD</kbd> {t('world.controls.move')}
          </span>
          <span>
            <kbd className="rpg-key">Shift</kbd> {t('world.controls.run')}
          </span>
          <span>
            <kbd className="rpg-key">Drag</kbd> {t('world.controls.rotate')}
          </span>
          <span>
            <kbd className="rpg-key">M</kbd> {t('world.controls.map')}
          </span>
          <button
            className="underline decoration-dotted"
            onClick={() => {
              runtime.zoom = 1;
              runtime.camYaw = 0;
              runtime.camPitch = 0.85;
            }}
          >
            {t('world.controls.reset_view')}
          </button>
        </div>
      )}

      <QuestLog />
      <EmoteDock touch={touch} />
      <Prompt touch={touch} />
      <Toast />
      <Completion />
    </div>
  );
}
