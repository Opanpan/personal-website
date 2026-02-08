import React from 'react';
import { useTranslation } from 'react-i18next';
import { m } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, Globe, Send } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    label: 'email',
    value: 'fanalriansyah@gmail.com',
    href: 'mailto:fanalriansyah@gmail.com',
  },
  {
    icon: MapPin,
    label: 'location',
    value: 'Jakarta, Indonesia',
    href: null,
  },
];

const socialLinks = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/Opanpan',
    username: '@Opanpan',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ifannnn/',
    username: '/in/ifannnn',
  },
  {
    icon: Globe,
    label: 'Website',
    href: 'https://my-profile.kinderheim511.com',
    username: 'Portfolio',
  },
];

export default function Contact() {
  const { t } = useTranslation('common');

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500/10 to-transparent" />
      </div>

      <div className="section-container relative">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary-500 font-medium tracking-wider uppercase text-sm">
            {t('contact.subtitle')}
          </span>
          <h2 className="heading-lg mt-2">{t('contact.title')}</h2>
          <p className="paragraph max-w-2xl mx-auto mt-4">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div data-aos="fade-right" data-aos-delay="100" className="flex flex-col items-center md:items-start">
            <div className="space-y-6 w-full">
              {contactInfo.map((item, index) => (
                <m.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-4 p-4 rounded-2xl glass-card card-hover"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(`contact.${item.label}`)}
                        </p>
                        <p className="font-medium text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t(`contact.${item.label}`)}
                        </p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )}
                </m.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mt-8 w-full">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center md:text-left">
                {t('contact.social')}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {socialLinks.map((social, index) => (
                  <m.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[var(--text-secondary)] hover:text-primary-500 hover:border-primary-500/30 transition-all"
                  >
                    <social.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{social.username}</span>
                  </m.a>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div data-aos="fade-left" data-aos-delay="200" className="flex items-center justify-center md:items-start md:justify-start">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="relative h-full glass-card p-8 overflow-hidden group max-w-sm md:max-w-none">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-cyan/5 group-hover:from-primary-500/10 group-hover:to-accent-cyan/10 transition-all duration-500" />

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent-cyan/10 rounded-full blur-2xl" />

                <div className="relative h-full flex flex-col justify-between">
                  <div className="text-center md:text-left">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center mb-6 mx-auto md:mx-0">
                      <Send className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-4">
                      {t('contact.work_together_title')}
                    </h3>

                    <p className="text-[var(--text-secondary)] mb-6">
                      {t('contact.work_together_description')}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {(t('contact.work_items', { returnObjects: true }) as string[]).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="mailto:fanalriansyah@gmail.com"
                    className="btn-primary w-full justify-center group/btn"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('contact.send_message')}
                      <Mail className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </a>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
