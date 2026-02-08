import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { m, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Menu, X, Sun, Moon, Globe, ChevronDown } from 'lucide-react';

const navItems = [
  { key: 'home', href: '#home' },
  { key: 'about', href: '#about' },
  { key: 'experience', href: '#experience' },
  { key: 'projects', href: '#projects' },
  { key: 'skills', href: '#skills' },
  { key: 'contact', href: '#contact' },
];

export default function Navigation() {
  const { t, i18n } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setScrollProgress(scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0);

      const sections = [...navItems].reverse();
      for (const section of sections) {
        const element = document.getElementById(section.key);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const currentLang = i18n.language === 'id' ? 'ID' : 'EN';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
        <m.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-cyan to-primary-400"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <m.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-0 ${
          isScrolled ? 'py-3 glass shadow-lg shadow-dark-900/5' : 'py-6 bg-transparent'
        }`}
      >
        <div className="section-container">
          <nav className="flex items-center justify-between">
            <m.a href="#home" className="relative group" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span className="font-display text-2xl font-bold tracking-tight">
                <span className="text-gradient">IF</span>
                <span className="text-[var(--text-primary)]">AN</span>
              </span>
            </m.a>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <m.a
                  key={item.key}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    activeSection === item.key
                      ? 'text-primary-500'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {activeSection === item.key && (
                    <m.span
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary-500/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </m.a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <m.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-dark-200/50 dark:hover:bg-dark-700/50 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLang}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </m.button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <m.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 py-2 w-32 glass-card shadow-xl"
                    >
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-200/50 dark:hover:bg-dark-700/50 transition-colors ${
                          i18n.language === 'en' ? 'text-primary-500 font-medium' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        🇺🇸 English
                      </button>
                      <button
                        onClick={() => changeLanguage('id')}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-200/50 dark:hover:bg-dark-700/50 transition-colors ${
                          i18n.language === 'id' ? 'text-primary-500 font-medium' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        🇮🇩 Indonesia
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              <m.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="relative p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-dark-200/50 dark:hover:bg-dark-700/50 transition-all overflow-hidden"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </m.button>

              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-dark-200/50 dark:hover:bg-dark-700/50 transition-all"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </m.button>
            </div>
          </nav>
        </div>
      </m.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] glass z-40 lg:hidden overflow-y-auto"
            >
              <div className="p-6 pt-24">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item, index) => (
                    <m.a
                      key={item.key}
                      href={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        activeSection === item.key
                          ? 'bg-primary-500/10 text-primary-500'
                          : 'text-[var(--text-secondary)] hover:bg-dark-200/50 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </m.a>
                  ))}
                </nav>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
