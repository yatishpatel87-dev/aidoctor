import React from 'react';
import { Sprout, Globe, Sparkles, Bell } from 'lucide-react';
import { Language } from '../types/plant';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateHome: () => void;
  onOpenScan: () => void;
  onOpenNotifications?: () => void;
  unreadRemindersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigateHome,
  onOpenScan,
  onOpenNotifications,
  unreadRemindersCount = 0,
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and App Title */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight">
                Plant AI Doctor
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                AI ડૉક્ટર
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </button>

        {/* Action Controls & Language Selector */}
        <div className="flex items-center gap-2">
          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
              title={t.notificationsTitle}
            >
              <Bell className="w-5 h-5 text-stone-700" />
              {unreadRemindersCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[9px] font-bold items-center justify-center">
                    {unreadRemindersCount > 9 ? '9+' : unreadRemindersCount}
                  </span>
                </span>
              )}
            </button>
          )}

          {/* Quick Scan Button (Desktop / Tablet) */}
          <button
            onClick={onOpenScan}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.scanPlant}</span>
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200/80">
            <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
            {(['gu', 'en', 'hi'] as Language[]).map((lang) => {
              const labels: Record<Language, string> = {
                gu: 'ગુજ',
                en: 'EN',
                hi: 'हिं',
              };
              const active = currentLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-emerald-700 shadow-xs border border-stone-200/50'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिंदी' : 'English'}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
