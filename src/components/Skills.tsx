import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getLanguages, getFrameworks, getTools, TechItem } from '@/lib/techStack';

const TechMarquee = ({ items }: { items: TechItem[] }) => {
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden py-4 group">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-8"
        animate={{
          x: ['0%', '-33.33%'],
        }}
        transition={{
          duration: 30,
          ease: 'linear',
          repeat: Infinity,
        }}
        style={{ width: 'fit-content' }}
      >
        {duplicatedItems.map((item, index) => (
          <motion.div
            key={`${item.name}-${index}`}
            whileHover={{ scale: 1.15, y: -5 }}
            className="flex items-center justify-center min-w-[100px] group/item cursor-pointer"
          >
            <img
              src={item.icon}
              alt={item.name}
              className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform duration-300"
              loading="lazy"
              title={item.name}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Skills() {
  const { t } = useTranslation('common');
  const languages = getLanguages();
  const frameworks = getFrameworks();
  const tools = getTools();

  return (
    <section id="skills" className="section-padding relative overflow-hidden bg-dark-50/50 dark:bg-dark-900/50">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative">
        <div className="section-container text-center mb-12" data-aos="fade-up">
          <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
            {t('skills.subtitle')}
          </span>
          <h2 className="heading-lg mt-2">{t('skills.title')}</h2>
        </div>

        <div data-aos="fade-up" data-aos-delay="100">
          <TechMarquee items={[...languages, ...frameworks, ...tools]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-container mt-16"
        >
          <div className="max-w-2xl mx-auto glass-card p-6 font-mono text-sm overflow-x-auto">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dark-200/50 dark:border-dark-700/50">
              <div className="w-3 h-3 rounded-full bg-accent-rose" />
              <div className="w-3 h-3 rounded-full bg-accent-amber" />
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="ml-4 text-[var(--text-muted)]">skills.ts</span>
            </div>
            <pre className="text-[var(--text-secondary)]">
              <code>
{`const skills = {
  languages: [`}<span className="text-accent-amber">'JavaScript'</span>, <span className="text-accent-amber">'TypeScript'</span>, <span className="text-accent-amber">'Go'</span>, <span className="text-accent-amber">'C'</span>{`],
  frameworks: [`}<span className="text-accent-amber">'React'</span>, <span className="text-accent-amber">'Next.js'</span>, <span className="text-accent-amber">'Vue'</span> , <span className="text-accent-amber">'Angular'</span>{`],
  passion: `}<span className="text-accent-amber">'Building great UX'</span>{`,
  learning: `}<span className="text-primary-500">true</span>{`
};`}
              </code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
