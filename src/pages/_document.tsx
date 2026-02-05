import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#22c55e" />
        
        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ifan Alriansyah Portfolio" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        
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
