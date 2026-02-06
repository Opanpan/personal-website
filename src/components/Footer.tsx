import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 border-t border-dark-200/50 dark:border-dark-800/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-100/50 dark:from-dark-950/50 to-transparent pointer-events-none" />

      <div className="section-container relative">
        {/* Top Row - Built With & Social Links */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 mb-8 pb-8 border-b border-dark-200/50 dark:border-dark-800/50">
          {/* Built With */}
          <div className="flex items-center gap-1 text-sm text-[var(--text-muted)] order-2 md:order-1">
            <span>Built with</span>
            <span className="text-primary-500 font-medium">Next.js</span>
            <span>&</span>
            <span className="text-accent-cyan font-medium">Tailwind CSS</span>
            <Heart className="w-4 h-4 text-accent-rose mx-1 animate-pulse" />
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            {[
              { icon: Github, href: 'https://github.com/Opanpan', label: 'GitHub' },
              { icon: Linkedin, href: 'https://www.linkedin.com/in/ifannnn/', label: 'LinkedIn' },
              { icon: Mail, href: 'mailto:fanalriansyah@gmail.com', label: 'Email' },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom Row - Centered Logo & Copyright */}
        <div className="flex flex-col items-center justify-center gap-2">
          <a href="#home" className="font-display text-xl font-bold">
            <span className="text-gradient">IF</span>
            <span className="text-[var(--text-primary)]">AN</span>
          </a>
          <p className="text-sm text-[var(--text-muted)] text-center">
            © {currentYear} Ifan Alriansyah. All rights reserved.
          </p>
        </div>

        {/* Back to Top */}
        <motion.a
          href="#home"
          whileHover={{ y: -4 }}
          className="absolute right-4 md:right-8 -top-[60px] p-3 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
          aria-label="Back to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.a>
      </div>
    </footer>
  );
}
