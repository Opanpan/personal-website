import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { Route, Play, X } from 'lucide-react';
import { interactables } from '../config';
import { runtime } from '../runtime';
import { useGame } from '../store';
import { continueTour, endTour, TOUR_ORDER } from '../tour';
import { interactableTitle } from './text';

/** Shown while the tour walks between stops, or when the player closed a panel mid-tour. */
export default function TourBar() {
  const { t } = useTranslation('common');
  const tour = useGame((s) => s.tour);
  const panel = useGame((s) => s.panel);
  // on small screens the bar sits at the top, where these overlays open
  const covered = useGame((s) => s.menuOpen || s.questOpen);
  const show = tour.active && !panel;
  // en-route state lives in the per-frame runtime, so re-check it a few times a second
  const [, tick] = useState(0);
  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => tick((n) => n + 1), 300);
    return () => clearInterval(id);
  }, [show]);
  const it = interactables.find((i) => i.id === TOUR_ORDER[tour.index]);
  // walking there by itself, or paused because the player closed/interrupted it
  const fading = useGame((s) => s.fading);
  const enRoute = !tour.seen && (fading || runtime.pendingOpen === TOUR_ORDER[tour.index]);

  return (
    <AnimatePresence>
      {show && it && (
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
          className={`lontar absolute top-[4.75rem] md:top-auto md:bottom-6 inset-x-0 mx-auto z-20 ${covered ? 'max-md:hidden' : ''} w-[min(30rem,calc(100vw-1.5rem))]`}
        >
          <div className="lontar-frame !rounded-full">
            <div className="lontar-page !rounded-full flex items-center gap-3 py-2 pl-5 pr-2">
              <Route className="h-5 w-5 shrink-0 text-[var(--soga)]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="lontar-label">{t('world.tour.stop', { n: tour.index + 1, total: TOUR_ORDER.length })}</p>
                <p className="truncate font-semibold text-[var(--ink)]">
                  {enRoute
                    ? t('world.tour.heading_to', { place: interactableTitle(it, t) })
                    : t('world.tour.paused', { place: interactableTitle(it, t) })}
                </p>
              </div>
              {!enRoute && (
                <button onClick={continueTour} className="lontar-btn !min-h-[40px] !px-3 text-sm" aria-label={t('world.tour.continue')}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t('world.tour.continue')}</span>
                </button>
              )}
              <button onClick={endTour} className="lontar-btn-ghost !min-h-[40px] !px-2.5" aria-label={t('world.tour.end')} title={t('world.tour.end')}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
