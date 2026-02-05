import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false });
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false });
const About = dynamic(() => import('@/components/About'), { ssr: false });
const Experience = dynamic(() => import('@/components/Experience'), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false });
const Quote = dynamic(() => import('@/components/Quote'), { ssr: false });
const Skills = dynamic(() => import('@/components/Skills'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default function Home() {
  const { i18n } = useTranslation();

  const title = 'Ifan Alriansyah | Senior Frontend Developer';
  const description = i18n.language === 'id'
    ? 'Frontend developer dengan pengalaman 5+ tahun di fintech dan sistem enterprise. Spesialisasi React, Next.js, Vue, Angular.'
    : 'Frontend developer with 5+ years experience in fintech and enterprise systems. Specialized in React, Next.js, Vue, Angular.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="keywords" content="Ifan Alriansyah, Frontend Developer, React Developer, Next.js, Vue.js, Angular, TypeScript, JavaScript, Indonesia, Jakarta" />
        <meta name="author" content="Ifan Alriansyah" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href="https://my-profile.kinderheim511.com" />
      </Head>

      <div className="noise-overlay" />
      
      <Navigation />
      
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Quote />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
