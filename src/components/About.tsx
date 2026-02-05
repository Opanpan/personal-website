import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AOS from 'aos';

const stats = [
  { value: '5+', key: 'years' },
  { value: '5+', key: 'projects' },
  { value: '3+', key: 'clients' },
];

export default function About() {
  const { t } = useTranslation('common');

  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/5 to-transparent pointer-events-none" />
      
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image/Visual */}
          <div
            data-aos="fade-right"
            data-aos-duration="800"
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
              {/* Abstract Decorative Element */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/20 via-accent-cyan/20 to-accent-violet/20 blur-3xl" />
              
              <div className="relative glass-card p-8 h-full flex flex-col justify-center">
                {/* Code Block Visual */}
                <div className="font-mono text-sm space-y-3">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-accent-rose" />
                    <div className="w-3 h-3 rounded-full bg-accent-amber" />
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                  </div>
                  
                  <div className="text-[var(--text-muted)]">
                    <span className="text-accent-violet">const</span>{' '}
                    <span className="text-accent-cyan">developer</span>{' '}
                    <span className="text-[var(--text-muted)]">=</span>{' '}
                    <span className="text-accent-amber">{'{'}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-primary-500">name</span>
                    <span className="text-[var(--text-muted)]">:</span>{' '}
                    <span className="text-accent-amber">&apos;Ifan Alriansyah&apos;</span>
                    <span className="text-[var(--text-muted)]">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-primary-500">role</span>
                    <span className="text-[var(--text-muted)]">:</span>{' '}
                    <span className="text-accent-amber">&apos;Senior Frontend&apos;</span>
                    <span className="text-[var(--text-muted)]">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-primary-500">experience</span>
                    <span className="text-[var(--text-muted)]">:</span>{' '}
                    <span className="text-accent-cyan">5</span>
                    <span className="text-[var(--text-muted)]">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-primary-500">passion</span>
                    <span className="text-[var(--text-muted)]">:</span>{' '}
                    <span className="text-accent-amber">&apos;Clean Code&apos;</span>
                    <span className="text-[var(--text-muted)]">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-primary-500">available</span>
                    <span className="text-[var(--text-muted)]">:</span>{' '}
                    <span className="text-primary-500">true</span>
                  </div>
                  <span className="text-accent-amber">{'}'}</span>
                </div>

                {/* Animated Cursor */}
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mt-4 w-2 h-5 bg-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div>
            <div data-aos="fade-up" data-aos-duration="600">
              <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
                {t('about.subtitle')}
              </span>
              <h2 className="heading-lg mt-2 mb-6">{t('about.title')}</h2>
            </div>

            <div
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
            >
              <p className="paragraph mb-6">{t('about.description')}</p>
              <p className="paragraph text-[var(--text-muted)]">
                {t('about.highlight')}
              </p>
            </div>

            {/* Stats */}
            <div
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
              className="grid grid-cols-3 gap-6 mt-10"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-2xl bg-dark-100/50 dark:bg-dark-800/50 border border-dark-200/50 dark:border-dark-700/50"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {t(`about.stats.${stat.key}`)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
