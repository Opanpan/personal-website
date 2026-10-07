import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sparkles, Sun, Zap, Volume2, VolumeX, Route } from 'lucide-react';
import { setQualityManual, setState, useGame } from '../store';
import { audio } from '../audio';
import { endTour, startTour } from '../tour';
import { useTheme } from '@/hooks/useTheme';

export function IconButton({
  onClick,
  label,
  children,
  active = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`rpg-icon-button ${active ? 'is-active' : ''}`}>
      {children}
    </button>
  );
}

export function LanguageToggle() {
  const { i18n, t } = useTranslation('common');
  const next = i18n.language === 'id' ? 'en' : 'id';
  return (
    <IconButton onClick={() => i18n.changeLanguage(next)} label={t('world.language')}>
      <Globe className="w-4 h-4" />
      <span className="text-xs font-bold">{i18n.language === 'id' ? 'ID' : 'EN'}</span>
    </IconButton>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');
  return (
    <IconButton onClick={toggleTheme} label={theme === 'dark' ? t('world.theme_day') : t('world.theme_night')}>
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </IconButton>
  );
}

export function QualityToggle() {
  const { t } = useTranslation('common');
  const quality = useGame((s) => s.quality);
  const next = quality === 'high' ? 'low' : 'high';
  return (
    <IconButton onClick={() => setQualityManual(next)} label={t(`world.quality_${next}`)} active={quality === 'high'}>
      {quality === 'high' ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
      <span className="text-xs font-bold hidden sm:inline">{quality === 'high' ? 'HD' : 'Lite'}</span>
    </IconButton>
  );
}

export function MuteToggle() {
  const { t } = useTranslation('common');
  const muted = useGame((s) => s.muted);
  React.useEffect(() => {
    // pick up the saved preference once
    setState({ muted: audio.muted });
  }, []);
  const toggle = () => {
    audio.init();
    audio.setMuted(!muted);
    setState({ muted: !muted });
  };
  return (
    <IconButton onClick={toggle} label={muted ? t('world.unmute') : t('world.mute')}>
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </IconButton>
  );
}

export function TourToggle() {
  const { t } = useTranslation('common');
  const active = useGame((s) => s.tour.active);
  return (
    <IconButton onClick={active ? endTour : startTour} label={active ? t('world.tour.end') : t('world.tour.take')} active={active}>
      <Route className="w-4 h-4" />
    </IconButton>
  );
}
