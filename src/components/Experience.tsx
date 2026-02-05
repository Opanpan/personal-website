import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Building2, ChevronRight } from 'lucide-react';

const experiences = ['pcs', 'lawencon', 'jojonomic'] as const;

export default function Experience() {
  const { t } = useTranslation('common');

  return (
    <section id="experience" className="section-padding relative overflow-hidden bg-dark-50/50 dark:bg-dark-900/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-cyan/10 rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
            {t('experience.subtitle')}
          </span>
          <h2 className="heading-lg mt-2">{t('experience.title')}</h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary-500/50 to-transparent md:-translate-x-1/2" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative mb-12 md:mb-16 ${
                index % 2 === 0 ? 'md:pr-[50%] md:text-right' : 'md:pl-[50%] md:ml-auto'
              }`}
            >
              {/* Timeline Node */}
              <div
                className={`absolute top-6 w-4 h-4 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50 ${
                  index % 2 === 0
                    ? 'left-0 md:left-auto md:right-0 md:translate-x-1/2 -translate-x-1/2 md:-mr-[calc(50%-0.5rem)]'
                    : 'left-0 -translate-x-1/2 md:translate-x-0 md:-ml-2'
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-30" />
              </div>

              {/* Content Card */}
              <div
                className={`ml-8 md:ml-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}
              >
                <div className="glass-card p-6 md:p-8 card-hover group">
                  {/* Header */}
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                    <div className="flex items-center gap-2 text-primary-500 mb-2">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">
                        {t(`experience.positions.${exp}.company`)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-display font-semibold text-[var(--text-primary)] mb-2">
                      {t(`experience.positions.${exp}.title`)}
                    </h3>

                    <div className={`flex flex-wrap gap-4 text-sm text-[var(--text-muted)] mb-4 ${
                      index % 2 === 0 ? 'md:justify-end' : ''
                    }`}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {t(`experience.positions.${exp}.location`)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {t(`experience.positions.${exp}.period`)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-[var(--text-secondary)] mb-4 ${
                    index % 2 === 0 ? 'md:text-right' : ''
                  }`}>
                    {t(`experience.positions.${exp}.description`)}
                  </p>

                  {/* Achievements */}
                  <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    {(t(`experience.positions.${exp}.achievements`, { returnObjects: true }) as string[]).map(
                      (achievement, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm text-[var(--text-muted)] ${
                            index % 2 === 0 ? 'md:flex-row-reverse' : ''
                          }`}
                        >
                          <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span>{achievement}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="glass-card p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2">
              BTech, Informatics
            </h3>
            <p className="text-[var(--text-secondary)]">
              Universitas Pembangunan Nasional Veteran Jakarta
            </p>
            <p className="text-sm text-[var(--text-muted)]">2016 - 2020</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
