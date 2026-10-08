import React from 'react';
import { Home, Camera, Sprout, History } from 'lucide-react';
import { Language } from '../types/plant';
import { translations } from '../i18n/translations';

export type NavTab = 'home' | 'scan' | 'plants' | 'history';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const t = translations[language];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-3 rounded-xl ${
            activeTab === 'home'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.4]' : ''}`} />
          <span className="text-[11px] font-medium leading-none">{t.home}</span>
        </button>

        {/* Scan Button (Center Elevated) */}
        <div className="relative -top-5">
          <button
            onClick={() => onTabChange('scan')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 hover:scale-105 transition-all border-4 border-white"
            title={t.scanPlant}
          >
            <Camera className="w-6 h-6 stroke-[2.4]" />
          </button>
          <span className="block text-center text-[10px] font-bold text-emerald-800 mt-0.5">
            {t.scan}
          </span>
        </div>

        {/* My Plants */}
        <button
          onClick={() => onTabChange('plants')}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-3 rounded-xl ${
            activeTab === 'plants'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sprout className={`w-5 h-5 ${activeTab === 'plants' ? 'stroke-[2.4]' : ''}`} />
          <span className="text-[11px] font-medium leading-none">{t.myPlants}</span>
        </button>

        {/* History */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 transition-colors py-1 px-3 rounded-xl ${
            activeTab === 'history'
              ? 'text-emerald-700 font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.4]' : ''}`} />
          <span className="text-[11px] font-medium leading-none">{t.history}</span>
        </button>
      </div>
    </nav>
  );
};
