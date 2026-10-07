import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowUpRight, ArrowRight, MapPin, Mail, Github, Linkedin, Compass, ScrollText, Flag } from 'lucide-react';
import { projects } from '@/lib/projects';
import { getFrameworks, getLanguages, getTools } from '@/lib/techStack';
import { Interactable, interactables, QUEST_GROUPS } from '../config';
import { setState, useGame } from '../store';
import { travelTo } from './MapOverlay';
import { endTour, nextStop, TOUR_ORDER } from '../tour';
import { interactableTitle } from './text';

const TITLE_ID = 'lontar-title';

const SOCIALS = [
  { icon: Mail, label: 'Email', href: 'mailto:fanalriansyah@gmail.com', handle: 'fanalriansyah@gmail.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ifannnn/', handle: 'linkedin.com/in/ifannnn' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/Opanpan', handle: 'github.com/Opanpan' },
];

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/** Brass corner fitting, drawn once and rotated into each corner of the frame. */
function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`pointer-events-none absolute h-9 w-9 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d58a" />
          <stop offset="0.5" stopColor="#b8892f" />
          <stop offset="1" stopColor="#6e4e14" />
        </linearGradient>
      </defs>
      <path d="M2 2h22a4 4 0 0 1-4 4H6v14a4 4 0 0 1-4 4z" fill="url(#brass)" />
      <circle cx="9.5" cy="9.5" r="3.2" fill="url(#brass)" stroke="#5c4010" strokeWidth="0.8" />
      <circle cx="9.5" cy="9.5" r="1" fill="#5c4010" />
    </svg>
  );
}

function Title({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 id={TITLE_ID} className={`lontar-title text-[1.9rem] sm:text-4xl text-[var(--ink)] ${className}`}>
      {children}
    </h2>
  );
}

function Flavor({ children }: { children: React.ReactNode }) {
  return <p className="font-[Playfair_Display,Georgia,serif] italic text-[var(--ink-muted)] text-[0.98rem]">{children}</p>;
}

/** Numbered list — "01, 02 …" in mono, reads like ledger entries rather than generic bullets. */
function Numbered({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-2 items-baseline">
          <span className="font-mono text-sm font-medium text-[var(--soga)] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span className="lontar-body !leading-snug text-[0.97rem]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function SocialRows() {
  return (
    <ul className="divide-y divide-[rgba(58,36,20,0.15)] border-y border-[rgba(58,36,20,0.15)]">
      {SOCIALS.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target={s.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group flex min-h-[48px] items-center gap-3 py-2.5 transition-colors hover:text-[var(--soga)]"
          >
            <s.icon className="h-[18px] w-[18px] shrink-0 text-[var(--soga)]" aria-hidden="true" />
            <span className="lontar-label !text-[var(--ink-muted)] w-20 shrink-0">{s.label}</span>
            <span className="flex-1 truncate font-medium">{s.handle}</span>
            <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Pages — each kind gets its own composition
// ---------------------------------------------------------------------------

function Content({ it }: { it: Interactable }) {
  const { t } = useTranslation('common');
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  switch (it.kind) {
    case 'welcome':
      return (
        <div className="space-y-5">
          <Flavor>{t('world.panel.welcome_intro')}</Flavor>
          <div>
            <Title>{t('hero.name')}</Title>
            <p className="mt-2 lontar-label !text-[0.8rem]">{t('hero.title')}</p>
          </div>
          <p className="lontar-body lontar-dropcap">{t('hero.subtitle')}</p>
          <SocialRows />
          <p className="lontar-body text-[0.92rem] flex gap-2">
            <Compass className="mt-1 h-4 w-4 shrink-0 text-[var(--soga)]" aria-hidden="true" />
            {t('world.panel.welcome_hint')}
          </p>
        </div>
      );

    case 'about':
      return (
        <div className="space-y-5">
          <Flavor>{t('world.panel.about_flavor')}</Flavor>
          <Title>{t('about.title')}</Title>
          <p className="lontar-body lontar-dropcap">{t('about.description')}</p>
          <blockquote className="border-l-[3px] border-[var(--soga)] pl-4 lontar-body text-[var(--ink)]">{t('about.highlight')}</blockquote>
          <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-1 max-w-sm">
            {[
              ['5+', 'years'],
              ['5+', 'projects'],
              ['3+', 'clients'],
            ].map(([v, k]) => (
              <div key={k} className="lontar-coin p-2">
                <span className="lontar-title text-2xl sm:text-3xl text-[var(--soga)]">{v}</span>
                <span className="mt-0.5 text-[0.68rem] sm:text-xs font-semibold leading-tight text-[var(--ink-muted)]">{t(`about.stats.${k}`)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'experience': {
      const k = `experience.positions.${it.ref}`;
      return (
        <div className="space-y-5">
          <Flavor>{t('world.panel.experience_flavor')}</Flavor>
          <div className="grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-2 items-end">
            <div>
              <p className="lontar-label">{t(`${k}.company`)}</p>
              <Title className="mt-1.5">{t(`${k}.title`)}</Title>
            </div>
            <div className="sm:text-right">
              <p className="font-mono text-sm font-medium text-[var(--ink)] tabular-nums">{t(`${k}.period`)}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-[var(--ink-muted)]">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {t(`${k}.location`)}
              </p>
            </div>
          </div>
          <hr className="lontar-rule" />
          <p className="lontar-body">{t(`${k}.description`)}</p>
          <div>
            <h3 className="lontar-label mb-3">{t('world.panel.achievements')}</h3>
            <Numbered items={list(`${k}.achievements`)} />
          </div>
        </div>
      );
    }

    case 'education':
      return (
        <div className="space-y-5">
          <Flavor>{t('world.panel.education_flavor')}</Flavor>
          <div>
            <p className="lontar-label">Universitas Pembangunan Nasional Veteran Jakarta</p>
            <Title className="mt-1.5">BTech, Informatics</Title>
            <p className="mt-2 font-mono text-sm text-[var(--ink)] tabular-nums">2016 – 2020</p>
          </div>
          <hr className="lontar-rule" />
          <p className="lontar-body">{t('world.panel.education_hint')}</p>
        </div>
      );

    case 'project': {
      const project = projects.find((p) => p.id === it.ref)!;
      const k = `projects.items.${project.id}`;
      return (
        <div className="space-y-6">
          <div>
            <p className="lontar-label">{t(`${k}.category`)}</p>
            <Title className="mt-1.5">{t(`${k}.title`)}</Title>
          </div>
          <figure className="lontar-photo -rotate-[0.6deg]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-[var(--lontar-deep)]">
              <Image src={project.image} alt={t(`${k}.title`)} fill sizes="(max-width: 768px) 100vw, 680px" className="object-cover object-top" />
            </div>
            <figcaption className="flex items-center justify-between gap-3 py-2 px-1 font-mono text-[0.7rem] text-[var(--ink-muted)]">
              <span className="truncate">{project.appUrl ? project.appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : t('world.panel.internal_app')}</span>
              <span className="shrink-0">{project.techStack.slice(0, 2).join(' · ')}</span>
            </figcaption>
          </figure>
          <p className="lontar-body lontar-dropcap">{t(`${k}.long_description`)}</p>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
            <div>
              <h3 className="lontar-label mb-3">{t('projects.key_features')}</h3>
              <Numbered items={list(`${k}.features`)} />
            </div>
            <div>
              <h3 className="lontar-label mb-3">{t('projects.tech_stack')}</h3>
              <ul className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <li key={tech} className="lontar-stamp">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {project.appUrl && (
            <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="lontar-btn">
              {t('world.panel.visit_site')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      );
    }

    case 'skills':
      return (
        <div className="space-y-6">
          <Flavor>{t('world.panel.skills_flavor')}</Flavor>
          <Title>{t('skills.title')}</Title>
          {(
            [
              ['languages', getLanguages()],
              ['frameworks', getFrameworks()],
              ['tools', getTools()],
            ] as const
          ).map(([key, items]) => (
            <section key={key}>
              <h3 className="lontar-label mb-3">{t(`skills.categories.${key}`)}</h3>
              <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {items.map((item) => (
                  <li key={item.name} className="flex flex-col items-center gap-2 rounded-lg border border-[rgba(58,36,20,0.18)] bg-[rgba(255,255,255,0.45)] px-2 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} alt="" className="h-8 w-8 object-contain" loading="lazy" />
                    <span className="text-xs font-semibold text-[var(--ink)] text-center leading-tight">{item.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );

    case 'quote':
      return (
        <figure className="py-4 sm:py-8 text-center">
          <Flavor>{t('world.panel.quote_flavor')}</Flavor>
          <blockquote id={TITLE_ID} className="lontar-title mt-6 text-[2.1rem] sm:text-5xl text-[var(--ink)]">
            Talk is cheap.
            <br />
            <em className="text-[var(--soga)]">Show me the code.</em>
          </blockquote>
          <hr className="lontar-rule mx-auto mt-7 w-40" />
          <figcaption className="mt-4 lontar-label">Linus Torvalds</figcaption>
        </figure>
      );

    case 'contact':
      return (
        <div className="space-y-5">
          <Flavor>{t('world.panel.contact_flavor')}</Flavor>
          <Title>{t('contact.title')}</Title>
          <p className="lontar-body">{t('contact.work_together_description')}</p>
          <div>
            <h3 className="lontar-label mb-3">{t('world.panel.how_i_help')}</h3>
            <Numbered items={list('contact.work_items')} />
          </div>
          <SocialRows />
          <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
            <a href="mailto:fanalriansyah@gmail.com" className="lontar-btn">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t('contact.send_message')}
            </a>
            <div className="text-right">
              <p className="font-[Playfair_Display,Georgia,serif] italic text-2xl text-[var(--ink)] leading-none">Ifan</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                <MapPin className="h-3 w-3" aria-hidden="true" /> Jakarta, Indonesia
              </p>
            </div>
          </div>
        </div>
      );
  }
}

function NextStop({ current }: { current: Interactable }) {
  const { t } = useTranslation('common');
  const visited = useGame((s) => s.visited);
  const next = QUEST_GROUPS.find((g) => interactables.some((i) => i.group === g && !visited.includes(i.id)));
  if (!next) return null;
  if (next === current.group) {
    const remaining = interactables.filter((i) => i.group === next && !visited.includes(i.id)).length;
    return <p className="text-sm text-[var(--ink-muted)]">{t('world.more_here', { count: remaining })}</p>;
  }
  return (
    <button onClick={() => travelTo(next)} className="lontar-btn-ghost text-sm">
      <Compass className="h-4 w-4 text-[var(--soga)]" aria-hidden="true" />
      {t('world.next', { place: t(`world.places.${next}.name`) })}
    </button>
  );
}

/** Footer controls while the guided tour is running. */
function TourControls() {
  const { t } = useTranslation('common');
  const tour = useGame((s) => s.tour);
  const last = tour.index >= TOUR_ORDER.length - 1;
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <p className="lontar-label mr-auto">{t('world.tour.stop', { n: tour.index + 1, total: TOUR_ORDER.length })}</p>
      <button onClick={endTour} className="lontar-btn-ghost text-sm">
        {t('world.tour.end')}
      </button>
      <button onClick={nextStop} className="lontar-btn text-sm" autoFocus>
        {last ? <Flag className="h-4 w-4" aria-hidden="true" /> : null}
        {last ? t('world.tour.finish') : t('world.tour.next')}
        {!last && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export default function Panel() {
  const { t } = useTranslation('common');
  const panel = useGame((s) => s.panel);
  const visitedCount = useGame((s) => s.visited.length);
  const touring = useGame((s) => s.tour.active);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const it = interactables.find((i) => i.id === panel);
  const close = () => setState({ panel: null });

  // move keyboard focus into the dialog when it opens, and back out when it closes
  useEffect(() => {
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) closeRef.current?.focus();
    }, 50);
    return () => {
      clearTimeout(id);
      previous?.focus?.();
    };
  }, [panel]);

  const entry = reduce ? { opacity: 0 } : { opacity: 0, y: 28, scaleY: 0.96 };

  return (
    <AnimatePresence>
      {it && (
        <m.div
          key="lontar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="absolute inset-0 z-30 flex items-end md:items-center justify-center bg-[rgba(20,12,6,0.55)] md:p-6"
          onClick={close}
        >
          <m.div
            key={it.id}
            initial={entry}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ ...entry, transition: { duration: 0.16, ease: 'easeIn' } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top center' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            className="lontar lontar-frame w-full md:max-w-[44rem] max-h-[92vh] md:max-h-[86vh] flex !rounded-b-none md:!rounded-b-[18px]"
          >
            <Corner className="-left-1 -top-1" />
            <Corner className="-right-1 -top-1 rotate-90" />
            <Corner className="-left-1 -bottom-1 -rotate-90 hidden md:block" />
            <Corner className="-right-1 -bottom-1 rotate-180 hidden md:block" />

            <div className="lontar-page flex min-h-0 w-full flex-col overflow-hidden">
              <div className="lontar-band shrink-0" aria-hidden="true" />

              <header className="flex shrink-0 items-center justify-between gap-4 px-5 sm:px-8 pt-4 pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <ScrollText className="h-4 w-4 shrink-0 text-[var(--soga)]" aria-hidden="true" />
                  <p className="lontar-label truncate">
                    {t(`world.places.${it.group}.name`)}
                    <span className="text-[var(--ink-muted)]"> · {interactableTitle(it, t)}</span>
                  </p>
                </div>
                <button ref={closeRef} onClick={close} className="lontar-knob shrink-0" aria-label={t('world.close')}>
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </header>
              <hr className="lontar-rule mx-5 sm:mx-8 shrink-0" />

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 py-6">
                <Content it={it} />
              </div>

              <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[rgba(58,36,20,0.15)] bg-[rgba(232,214,176,0.55)] px-5 sm:px-8 py-3">
                {touring ? (
                  <TourControls />
                ) : (
                  <>
                <NextStop current={it} />
                <p className="ml-auto flex items-center gap-3 text-xs text-[var(--ink-muted)]">
                  <span className="font-mono tabular-nums">
                    {t('world.panel.collected', { count: visitedCount, total: interactables.length })}
                  </span>
                  <span className="hidden sm:inline">
                    <kbd className="rounded border border-[rgba(58,36,20,0.3)] bg-white/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-[var(--ink)]">Esc</kbd>{' '}
                    {t('world.close')}
                  </span>
                </p>
                  </>
                )}
              </footer>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
