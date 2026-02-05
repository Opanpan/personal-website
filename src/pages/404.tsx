import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Layers } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function NotFound() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
        <meta name="robots" content="noindex" />
      </Head>

      <Navigation />

      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/5 to-transparent" />
        </div>

        <div className="section-container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* 404 Number */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="text-9xl font-display font-bold bg-gradient-to-br from-primary-500 to-cyan-500 bg-clip-text text-transparent">
                404
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="heading-lg text-[var(--text-primary)] mb-4">
                Page Not Found
              </h1>
              <p className="text-lg text-[var(--text-secondary)] mb-8">
                The page you're looking for doesn't exist or has been moved. But don't worry, you can always find what you need here.
              </p>
            </motion.div>

            {/* Navigation Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* Home Button */}
              <Link href="/">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-primary-500/50"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </motion.a>
              </Link>

              {/* Projects Button */}
              <Link href="/#projects">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl glass-card text-[var(--text-primary)] font-medium border border-dark-200/50 dark:border-dark-700/50 hover:border-primary-500/50 transition-all"
                >
                  <Layers className="w-5 h-5" />
                  View Projects
                </motion.a>
              </Link>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 p-6 glass-card rounded-xl border border-dark-200/50 dark:border-dark-700/50"
            >
              <h3 className="text-sm font-medium text-primary-500 uppercase tracking-wider mb-2">
                Helpful Tips
              </h3>
              <ul className="text-left space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <span>Check the URL and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <span>Use the navigation menu to explore</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <span>Visit my projects directly: /projects/banking_platform, /projects/hris_system, /projects/lowcode_builder</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
