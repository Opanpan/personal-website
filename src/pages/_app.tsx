import '@/styles/globals.css';
import 'aos/dist/aos.css';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { LazyMotion } from 'framer-motion';
import { ThemeProvider } from '@/hooks/useTheme';
import '@/lib/i18n';

const loadFeatures = () => import('@/lib/framer-features').then((res) => res.default);

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Scroll to top on page load and hot reload
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Lazy load AOS JS after initial render to reduce TBT
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.default.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic',
        offset: 50,
      });
    });
  }, []);

  return (
    <ThemeProvider>
      <LazyMotion features={loadFeatures} strict>
        <Component {...pageProps} />
      </LazyMotion>
    </ThemeProvider>
  );
}

export default MyApp;
