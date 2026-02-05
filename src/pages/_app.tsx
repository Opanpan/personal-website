import '@/styles/globals.css';
import 'aos/dist/aos.css';
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import AOS from 'aos';
import { ThemeProvider } from '@/hooks/useTheme';
import '@/lib/i18n';

function MyApp({ Component, pageProps }: AppProps) {
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
