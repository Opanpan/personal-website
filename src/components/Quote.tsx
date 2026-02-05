import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

export default function Quote() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="relative section-container"
      >
        {/* Code bracket top */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
          <Code2 className="w-6 h-6 text-primary-500" />
          <span className="text-primary-500 font-mono text-sm font-bold tracking-wider">
            PHILOSOPHY.EXECUTE()
          </span>
        </motion.div>

        {/* Quote Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Left Quote Mark */}
          <motion.div
            variants={itemVariants}
            className="text-9xl md:text-[150px] font-bold text-primary-500/10 leading-none -ml-12 -mb-8"
          >
            "
          </motion.div>

          {/* Quote Text */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-center text-[var(--text-primary)] leading-tight mb-8"
          >
            Talk is cheap.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-accent-cyan to-primary-500">
              Show me the code.
            </span>
          </motion.h2>

          {/* Author */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
            <p className="text-center text-[var(--text-secondary)] text-lg font-medium">
              <span className="text-primary-500">— Linus Torvalds</span>
            </p>
          </motion.div>

          {/* Right Quote Mark */}
          <motion.div
            variants={itemVariants}
            className="text-9xl md:text-[150px] font-bold text-primary-500/10 leading-none -mt-8 flex justify-end"
          >
            "
          </motion.div>
        </div>

        {/* Bottom code-like decorations */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-2 text-primary-500/60 font-mono text-sm"
        >
          <span className="hidden md:inline">{'</'}</span>
          <span>actions</span>
          <span className="hidden md:inline">{'>'}</span>
          <span className="animate-pulse">_</span>
        </motion.div>
      </motion.div>

      {/* Animated background line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent origin-left"
      />
    </section>
  );
}
