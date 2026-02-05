import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, ArrowUpRight } from 'lucide-react';
import { projects } from '@/lib/projects';

export default function Projects() {
  const { t } = useTranslation('common');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;

  return (
    <section id="projects" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/5 to-transparent" />
      </div>

      <div className="section-container relative">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
            {t('projects.subtitle')}
          </span>
          <h2 className="heading-lg mt-2">{t('projects.title')}</h2>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative glass-card overflow-hidden card-hover h-full flex flex-col">
                {/* Project Image/Gradient */}
                <div className={`relative h-48 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
                  {/* Overlay Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id={`grid-${project.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#grid-${project.id})`} />
                    </svg>
                  </div>

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-16 h-16 text-white/80" />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedProjectId(project.id)}
                      className="px-6 py-3 bg-white text-dark-900 rounded-full font-medium flex items-center gap-2 cursor-pointer"
                    >
                      {t('projects.view_details')}
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-2">
                    {t(`projects.items.${project.id}.category`)}
                  </span>
                  <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-3 group-hover:text-primary-500 transition-colors">
                    {t(`projects.items.${project.id}.title`)}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm flex-1">
                    {t(`projects.items.${project.id}.description`)}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dark-200/50 dark:border-dark-700/50">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-dark-200/50 dark:bg-dark-700/50 text-[var(--text-secondary)]"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-500/10 text-primary-500">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProjectId(null)}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
              onClick={() => setSelectedProjectId(null)}
            >
              <div
                className="glass-card overflow-hidden flex flex-col max-h-[90vh] w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section - Top */}
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex-shrink-0">
                  <img
                    src={selectedProject.image}
                    alt={t(`projects.items.${selectedProject.id}.title`)}
                    className="w-full h-full object-cover"
                  />
                  {/* Fallback gradient if image fails to load */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedProject.gradient} flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity`}>
                    <Layers className="w-20 h-20 text-white/80" />
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedProjectId(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Modal Body - Bottom */}
                <div className="p-6 lg:p-8 overflow-y-auto flex-1">
                  <span className="text-sm font-medium text-primary-500 uppercase tracking-wider">
                    {t(`projects.items.${selectedProject.id}.category`)}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mt-2 mb-4">
                    {t(`projects.items.${selectedProject.id}.title`)}
                  </h3>

                  <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                    {t(`projects.items.${selectedProject.id}.long_description`)}
                  </p>

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                      {t('projects.key_features')}
                    </h4>
                    <ul className="space-y-2">
                      {(t(`projects.items.${selectedProject.id}.features`, { returnObjects: true }) as string[]).map(
                        (feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                      {t('projects.tech_stack')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-2 text-sm font-medium rounded-full bg-dark-200/50 dark:bg-dark-700/50 text-[var(--text-secondary)] border border-dark-300/50 dark:border-dark-600/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="mt-8 pt-6 border-t border-dark-200/50 dark:border-dark-700/50">
                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className="w-full py-3 rounded-xl bg-dark-200/50 dark:bg-dark-700/50 text-[var(--text-secondary)] hover:bg-dark-300/50 dark:hover:bg-dark-600/50 transition-colors font-medium"
                    >
                      {t('projects.close')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
