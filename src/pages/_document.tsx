import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-satoshi: system-ui, -apple-system, sans-serif;
            --font-clash: system-ui, -apple-system, sans-serif;
            --text-primary: #09090b;
            --bg-primary: #fafafa;
          }
          .dark {
            --text-primary: #fafafa;
            --bg-primary: #09090b;
          }
          html { font-family: var(--font-satoshi); scroll-behavior: smooth; }
          body { background-color: var(--bg-primary); color: var(--text-primary); }
        ` }} />

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />

        {/* Load fonts asynchronously to avoid render-blocking */}
        {/* Satoshi font loaded first (primary body font) */}
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
          as="style"
          media="(min-width: 0px)"
          crossOrigin="anonymous"
          onLoad={(e) => { (e.target as any).media = 'all'; (e.target as HTMLElement).onload = null; }}
        />
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
          as="style"
          media="(min-width: 0px)"
          crossOrigin="anonymous"
          onLoad={(e) => { (e.target as any).media = 'all'; (e.target as HTMLElement).onload = null; }}
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          as="style"
          media="(min-width: 0px)"
          crossOrigin="anonymous"
          onLoad={(e) => { (e.target as any).media = 'all'; (e.target as HTMLElement).onload = null; }}
        />
        <noscript>
          <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" />
        </noscript>

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#22c55e" />

        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ifan Alriansyah Portfolio" />
        <meta property="og:title" content="Ifan Alriansyah - Senior Frontend Developer" />
        <meta property="og:description" content="Senior Frontend Developer specializing in React, Next.js, Vue.js, and Angular. Based in Jakarta, Indonesia." />
        <meta property="og:url" content="https://ifan.kinderheim511.com" />
        <meta property="og:image" content="https://ifan.kinderheim511.com/og-image.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ifan Alriansyah - Senior Frontend Developer Portfolio" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ifan Alriansyah - Senior Frontend Developer" />
        <meta name="twitter:description" content="Senior Frontend Developer specializing in React, Next.js, Vue.js, and Angular." />
        <meta name="twitter:image" content="https://ifan.kinderheim511.com/og-image.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Ifan Alriansyah',
              jobTitle: 'Senior Frontend Developer',
              url: 'https://my-profile.kinderheim511.com',
              sameAs: [
                'https://github.com/Opanpan',
                'https://www.linkedin.com/in/ifannnn/',
              ],
              email: 'fanalriansyah@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Jakarta',
                addressCountry: 'Indonesia',
              },
              alumniOf: {
                '@type': 'EducationalOrganization',
                name: 'Universitas Pembangunan Nasional Veteran Jakarta',
              },
              knowsAbout: [
                'React',
                'Next.js',
                'Vue.js',
                'Angular',
                'TypeScript',
                'JavaScript',
                'Frontend Development',
                'Web Development',
              ],
            }),
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
