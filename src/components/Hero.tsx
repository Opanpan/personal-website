import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 grid-background z-0" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[128px]"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-violet/10 rounded-full blur-[150px]"
        />
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 section-container text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {t('hero.greeting')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="heading-xl mb-6 relative z-20"
        >
          <span className="block text-[var(--text-primary)] relative z-20">{t('hero.name')}</span>
          <span className="block text-gradient-hero mt-2 relative z-20">{t('hero.title')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="paragraph max-w-2xl mx-auto mb-10"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <a href="#projects" className="btn-primary group">
            <span className="relative z-10 flex items-center gap-2">
              {t('hero.cta_primary')}
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </a>
          <a
            href="/cv/Ifan_Alriansyah_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            {t('hero.cta_secondary')}
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center justify-center gap-4"
        >
          {[
            { icon: Github, href: 'https://github.com/Opanpan', label: 'GitHub' },
            { icon: Linkedin, href: 'https://www.linkedin.com/in/ifannnn/', label: 'LinkedIn' },
            { icon: Mail, href: 'mailto:fanalriansyah@gmail.com', label: 'Email' },
          ].map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-full bg-dark-200/50 dark:bg-dark-800/50 text-[var(--text-secondary)] hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
              aria-label={social.label}
            >
              <social.icon className="w-5 h-5" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
          {t('hero.scroll_text')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="w-5 h-5 text-primary-500" />
        </motion.div>
      </motion.div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-20 left-8 w-20 h-20 border-l-2 border-t-2 border-primary-500/20 rounded-tl-3xl hidden lg:block z-0 pointer-events-none" />
      <div className="absolute bottom-20 right-8 w-20 h-20 border-r-2 border-b-2 border-primary-500/20 rounded-br-3xl hidden lg:block z-0 pointer-events-none" />
    </section>
  );
}
