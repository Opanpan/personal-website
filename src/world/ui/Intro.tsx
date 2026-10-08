import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, LayoutList, Loader2, Route, Hand } from 'lucide-react';
import { audio } from '../audio';
import { startTour } from '../tour';
import { setState, useGame } from '../store';
import { interactables } from '../config';
import { LanguageToggle } from './Controls';

export default function Intro({ touch }: { touch: boolean }) {
  const { t } = useTranslation('common');
  const started = useGame((s) => s.started);
  const visited = useGame((s) => s.visited.length);
  const ready = useGame((s) => s.ready);
  const reduce = useReducedMotion();

  // just the three things you need to start playing; the rest is discoverable in-game
  const hints = touch
    ? [
        ['🕹️', t('world.controls.touch_move')],
        ['👆', t('world.controls.touch_tap')],
        ['✨', t('world.controls.touch_interact')],
      ]
    : [
        ['WASD', t('world.controls.move')],
        ['Space', t('world.controls.jump')],
        ['E', t('world.controls.interact')],
      ];

  const begin = () => {
    audio.init();
    setState({ started: true });
  };

  return (
    <AnimatePresence>
      {!started && (
        <m.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="absolute inset-0 z-40 flex items-end md:items-center justify-center p-4 md:p-8 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
        >
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>
          <m.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 18 }}
            className="rpg-panel w-full max-w-md p-6 md:p-8 text-center"
          >
            <m.div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-primary-500/30 bg-gradient-to-br from-primary-500 to-accent-cyan"
              animate={reduce ? undefined : { rotate: [0, 18, -8, 18, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
              style={{ transformOrigin: '70% 80%' }}
              aria-hidden="true"
            >
              <Hand className="h-7 w-7" />
            </m.div>

            <h1 className="font-display text-5xl md:text-6xl font-bold leading-none bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-violet bg-clip-text text-transparent">
              {t('world.title')}
            </h1>
            <p className="mt-3 text-sm md:text-base text-[var(--ui-text-2)]">
              <span className="font-semibold text-[var(--ui-text)]">{t('hero.name')}</span> · {t('hero.title')}
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {hints.map(([key, label]) => (
                <li key={label} className="flex items-center gap-2 rounded-full bg-[var(--ui-soft)] border border-[var(--ui-line)] py-1.5 pl-1.5 pr-3">
                  <kbd className="rpg-key">{key}</kbd>
                  <span className="text-xs font-medium text-[var(--ui-text-2)]">{label}</span>
                </li>
              ))}
            </ul>

            <button onClick={begin} disabled={!ready} className="rpg-button rpg-button-primary mt-7 w-full !py-4 text-lg disabled:opacity-70 disabled:cursor-wait">
              {ready ? <Play className="w-5 h-5 fill-current" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              {!ready ? t('world.loading') : visited > 0 ? t('world.continue', { count: visited, total: interactables.length }) : t('world.start')}
            </button>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button onClick={startTour} disabled={!ready} className="rpg-button !px-4 !py-2 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-wait">
                <Route className="w-4 h-4" />
                {t('world.tour.take')}
              </button>
              <Link href="/classic" className="rpg-button !px-4 !py-2 text-sm whitespace-nowrap">
                <LayoutList className="w-4 h-4" />
                {t('world.classic')}
              </Link>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
