import React from 'react';
import { useTranslation } from 'react-i18next';
import { m } from 'framer-motion';
import { MapPin, Calendar, Building2, ChevronRight, GraduationCap } from 'lucide-react';

const experiences = ['pcs', 'lawencon', 'jojonomic'] as const;

const cardAccents = [
  {
    gradient: 'from-accent-cyan to-primary-500',
    pill: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    chevron: 'bg-accent-cyan/10 text-accent-cyan',
    glow: 'hover:shadow-accent-cyan/10',
  },
  {
    gradient: 'from-accent-violet to-accent-cyan',
    pill: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20',
    chevron: 'bg-accent-violet/10 text-accent-violet',
    glow: 'hover:shadow-accent-violet/10',
  },
  {
    gradient: 'from-accent-amber to-accent-rose',
    pill: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    chevron: 'bg-accent-amber/10 text-accent-amber',
    glow: 'hover:shadow-accent-amber/10',
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const achievementContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const achievementItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Experience() {
  const { t } = useTranslation('common');

  return (
    <section id="experience" className="section-padding relative overflow-hidden bg-dark-50/50 dark:bg-dark-900/50">
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-violet/10 rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
            {t('experience.subtitle')}
          </span>
          <h2 className="heading-lg mt-2">{t('experience.title')}</h2>
        </div>

        {/* Experience Cards */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-4xl mx-auto"
        >
          {experiences.map((exp, index) => {
            const accent = cardAccents[index];

            return (
              <React.Fragment key={exp}>
                <m.div variants={cardVariants} className="group relative">
                  {/* Watermark number */}
                  <div className="absolute -top-4 right-2 md:-top-6 md:right-6 select-none pointer-events-none overflow-hidden">
                    <span
                      className={`text-[7rem] md:text-[10rem] font-display font-bold leading-none bg-gradient-to-br ${accent.gradient} bg-clip-text text-transparent opacity-[0.06] dark:opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.12] dark:group-hover:opacity-[0.08]`}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  {/* Card */}
                  <div
                    className={`glass-card relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${accent.glow}`}
                  >
                    {/* Gradient left bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="p-6 md:p-8 pl-8 md:pl-10">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border ${accent.pill}`}
                        >
                          <Building2 className="w-3 h-3" />
                          {t(`experience.positions.${exp}.company`)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono tracking-wider bg-dark-100/50 dark:bg-dark-700/50 px-2.5 py-1 rounded-md">
                          <Calendar className="w-3 h-3" />
                          {t(`experience.positions.${exp}.period`)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <MapPin className="w-3 h-3" />
                          {t(`experience.positions.${exp}.location`)}
                        </span>
                      </div>

                      {/* Role title */}
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] mb-3">
                        {t(`experience.positions.${exp}.title`)}
                      </h3>

                      {/* Description */}
                      <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-5 max-w-3xl">
                        {t(`experience.positions.${exp}.description`)}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-dark-200/60 via-dark-300/30 to-transparent dark:from-dark-600/60 dark:via-dark-700/30 mb-5" />

                      {/* Achievements */}
                      <m.div
                        variants={achievementContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        {(
                          t(`experience.positions.${exp}.achievements`, {
                            returnObjects: true,
                          }) as string[]
                        ).map((achievement, i) => (
                          <m.div
                            key={i}
                            variants={achievementItemVariants}
                            className="flex items-start gap-2.5 group/item"
                          >
                            <span
                              className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 ${accent.chevron} transition-transform duration-300 group-hover:translate-x-0.5`}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-sm text-[var(--text-muted)] group-hover/item:text-[var(--text-secondary)] transition-colors duration-300">
                              {achievement}
                            </span>
                          </m.div>
                        ))}
                      </m.div>
                    </div>
                  </div>
                </m.div>

                {/* Connector dots */}
                {index < experiences.length - 1 && (
                  <div className="flex flex-col items-center gap-1.5 py-5">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${accent.gradient} opacity-25`}
                      />
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </m.div>

        {/* Education */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="glass-card relative overflow-hidden">
            {/* Gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-violet" />

            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-1 text-center md:text-left gap-2">
                <div>
                  <h3 className="text-xl font-display font-semibold text-[var(--text-primary)]">
                    BTech, Informatics
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm md:text-base">
                    Universitas Pembangunan Nasional Veteran Jakarta
                  </p>
                </div>
                <span className="inline-flex items-center justify-center gap-1.5 font-mono text-sm text-[var(--text-muted)] tracking-wider bg-dark-100/50 dark:bg-dark-700/50 px-3 py-1.5 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  2016 - 2020
                </span>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
