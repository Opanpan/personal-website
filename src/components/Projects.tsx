import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, ArrowUpRight, ExternalLink } from 'lucide-react';
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
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative glass-card overflow-hidden card-hover h-full flex flex-col">
                {/* Project Image/Gradient */}
                <div className={`relative h-48 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
                  {/* Project Image */}
                  <img
                    src={project.image}
                    alt={t(`projects.items.${project.id}.title`)}
                    className="w-full h-full object-cover object-center"
                  />

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

                  {/* Icon - Fallback */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

      {/* Project Detail Modal - Modern Full Image Design */}
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
              className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md z-50"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
              onClick={() => setSelectedProjectId(null)}
            >
              <div
                className="relative w-full h-full max-w-4xl max-h-[90vh] md:max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Full Background Image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedProject.gradient} overflow-hidden`}>
                  <img
                    src={selectedProject.image}
                    alt={t(`projects.items.${selectedProject.id}.title`)}
                    className="w-full h-full object-cover object-center scale-105 blur-sm"
                  />
                  {/* Dark Gradient Overlay - Enhanced for better content contrast */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />

                  {/* Side gradient overlays for edge enhancement */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                </div>

                {/* Close Button - Top Right */}
                <motion.button
                  whileHover={{ scale: 1.15, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProjectId(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 rounded-full bg-white/10 text-white backdrop-blur-xl transition-all z-20 border border-white/30 shadow-lg flex items-center justify-center"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Gradient fade for scrollable content */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent z-0" />

                {/* Content Overlay - Scrollable */}
                <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 lg:p-10">
                  {/* Actual Content */}
                  <div className="relative z-10 min-h-full flex flex-col justify-end">
                    {/* Category Badge */}
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center text-xs md:text-sm font-bold text-primary-300 uppercase tracking-widest px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-primary-500/30 to-primary-400/20 backdrop-blur-xl border border-primary-400/50 shadow-lg"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mr-2 animate-pulse" />
                      {t(`projects.items.${selectedProject.id}.category`)}
                    </motion.span>

                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mt-2 sm:mt-3 mb-2 sm:mb-3 md:mt-4 md:mb-4 leading-snug sm:leading-tight"
                    >
                      {t(`projects.items.${selectedProject.id}.title`)}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed mb-3 sm:mb-4 md:mb-6 max-w-3xl"
                    >
                      {t(`projects.items.${selectedProject.id}.long_description`)}
                    </motion.p>

                    {/* Two Column Layout for Features and Tech Stack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                      {/* Key Features */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <h4 className="text-xs md:text-sm font-bold text-primary-300 uppercase tracking-wider mb-3 md:mb-4">
                          {t('projects.key_features')}
                        </h4>
                        <ul className="space-y-2 md:space-y-3">
                          {(t(`projects.items.${selectedProject.id}.features`, { returnObjects: true }) as string[]).map(
                            (feature, i) => (
                              <li key={i} className="flex items-start gap-2 md:gap-3 text-gray-100">
                                <span className="w-2 h-2 rounded-full bg-primary-400 mt-1 md:mt-2 flex-shrink-0" />
                                <span className="text-xs md:text-sm">{feature}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </motion.div>

                      {/* Tech Stack */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="text-xs md:text-sm font-bold text-primary-300 uppercase tracking-wider mb-3 md:mb-4">
                          {t('projects.tech_stack')}
                        </h4>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {selectedProject.techStack.map((tech) => (
                            <motion.span
                              key={tech}
                              whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                              className="px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold rounded-full bg-white/10 backdrop-blur-xl text-gray-100 border border-white/30 hover:border-white/50 transition-all shadow-md"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Open App Button */}
                    {selectedProject.appUrl && (
                      <motion.a
                        href={selectedProject.appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 md:mt-8 px-5 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-3.5 rounded-xl md:rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/30 transition-all font-medium md:font-semibold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:border-white/50 cursor-pointer inline-flex"
                      >
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                        {t('projects.open_app')}
                      </motion.a>
                    )}

                    {/* Close Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedProjectId(null)}
                      className="mt-6 md:mt-8 px-5 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-3.5 rounded-xl md:rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/30 transition-all font-medium md:font-semibold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:border-white/50"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                      {t('projects.close')}
                    </motion.button>
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
