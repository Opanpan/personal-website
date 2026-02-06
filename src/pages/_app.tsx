import '@/styles/globals.css';
import 'aos/dist/aos.css';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AOS from 'aos';
import { ThemeProvider } from '@/hooks/useTheme';
import '@/lib/i18n';

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

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 50,
    });
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
