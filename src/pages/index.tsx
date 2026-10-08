import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

function Loading() {
  const { t } = useTranslation('common');
  // this also renders on the server (always English); only show translated text once mounted
  // so the client's first render matches and hydration doesn't fail
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* IA badge inside a spinning hero-gradient ring */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,#22c55e,#06b6d4,#8b5cf6,transparent_85%)] motion-reduce:animate-none" />
        <div className="absolute inset-[4px] rounded-full bg-[var(--bg-primary)]" />
        <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan font-display text-lg font-bold text-white">
          IA
        </div>
      </div>
      <p className="font-display text-3xl font-bold bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-violet bg-clip-text text-transparent">
        {mounted ? t('world.title') : '\u00a0'}
      </p>
      <p className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]" role="status">
        {/* the bouncing dots stand in for the string's own ellipsis */}
        {mounted ? t('world.loading').replace(/(…|\.\.\.)$/, '') : ''}
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />
        ))}
      </p>
    </div>
  );
}

const Game = dynamic(() => import('@/world/Game'), { ssr: false, loading: Loading });

export default function Home() {
  const { i18n } = useTranslation();

  const title = 'Ifan Alriansyah | Senior Frontend Developer';
  const description =
    i18n.language === 'id'
      ? 'Jelajahi portofolio 3D interaktif Ifan Alriansyah, frontend developer dengan pengalaman 5+ tahun di fintech dan sistem enterprise.'
      : 'Explore the interactive 3D portfolio of Ifan Alriansyah, a frontend developer with 5+ years experience in fintech and enterprise systems.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="keywords" content="Ifan Alriansyah, Frontend Developer, React Developer, Next.js, Three.js, 3D Portfolio, TypeScript, Indonesia, Jakarta" />
        <meta name="author" content="Ifan Alriansyah" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href="https://ifan.alriansyah.my.id" />
      </Head>

      {/* Text summary for crawlers and screen readers; the 3D world is purely visual */}
      <div className="sr-only">
        <h1>Ifan Alriansyah, Senior Frontend Developer</h1>
        <p>Frontend developer with 5+ years experience in fintech and enterprise systems, specialized in React, Next.js, Vue and Angular.</p>
        <Link href="/classic">View the classic portfolio</Link>
      </div>
      <noscript>
        <p style={{ padding: 24 }}>
          JavaScript is required for the 3D portfolio. <a href="/classic">View the classic portfolio</a>.
        </p>
      </noscript>

      <Game />
    </>
  );
}
