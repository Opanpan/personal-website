import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { Play, LayoutList, Loader2, Route } from 'lucide-react';
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

  const controls = touch
    ? [
        ['🕹️', t('world.controls.touch_move')],
        ['👆', t('world.controls.touch_tap')],
        ['🔄', t('world.controls.touch_rotate')],
        ['✋', t('world.controls.touch_interact')],
      ]
    : [
        ['WASD', t('world.controls.move')],
        ['Shift', t('world.controls.run')],
        ['🖱️', t('world.controls.click')],
        ['Drag', t('world.controls.rotate')],
        ['E', t('world.controls.interact')],
        ['Space', t('world.controls.jump')],
        ['1·2·3', t('world.controls.emotes')],
        ['M', t('world.controls.map')],
        ['Q', t('world.controls.quest')],
      ];

  return (
    <AnimatePresence>
      {!started && (
        <m.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="absolute inset-0 z-40 flex items-end md:items-center justify-center p-4 md:p-8 bg-gradient-to-t from-black/80 via-black/30 to-black/10"
        >
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>
          <m.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="rpg-panel w-full max-w-xl p-6 md:p-8 text-center"
          >
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-amber-300/90 font-semibold">{t('world.tagline')}</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold text-white leading-tight">{t('world.title')}</h1>
            <p className="mt-3 text-sm md:text-base text-white/80">
              <span className="font-semibold text-white">{t('hero.name')}</span> · {t('hero.title')}
            </p>
            <p className="mt-4 text-sm text-white/70 max-w-md mx-auto">{t('world.intro')}</p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
              {controls.map(([key, label]) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                  <kbd className="rpg-key">{key}</kbd>
                  <span className="text-xs text-white/80 leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  audio.init();
                  setState({ started: true });
                }}
                disabled={!ready}
                className="rpg-button rpg-button-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-wait"
              >
                {ready ? <Play className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                {!ready ? t('world.loading') : visited > 0 ? t('world.continue', { count: visited, total: interactables.length }) : t('world.start')}
              </button>
              <button onClick={startTour} disabled={!ready} className="rpg-button w-full sm:w-auto disabled:opacity-60 disabled:cursor-wait">
                <Route className="w-5 h-5" />
                {t('world.tour.take')}
              </button>
              <Link href="/classic" className="rpg-button w-full sm:w-auto">
                <LayoutList className="w-5 h-5" />
                {t('world.classic')}
              </Link>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
