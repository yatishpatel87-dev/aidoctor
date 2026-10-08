import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sprout,
  History,
  Sparkles,
  Droplet,
  Sun,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Bell,
  CheckCircle2,
  FlaskConical,
  Scissors,
  Bug,
  Search,
} from 'lucide-react';
import { Language, ScanRecord, PlantProfile, PlantCareReminder, TaskType } from '../types/plant';
import { translations } from '../i18n/translations';
import { db, getTodayDateString } from '../services/storageService';
import { notificationService } from '../services/notificationService';

interface HomeDashboardProps {
  language: Language;
  onOpenScanCamera: () => void;
  onOpenScanUpload: () => void;
  onNavigateTab: (tab: 'plants' | 'history') => void;
  onSelectScan: (scan: ScanRecord) => void;
  onOpenNotifications: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  onOpenScanCamera,
  onOpenScanUpload,
  onNavigateTab,
  onSelectScan,
  onOpenNotifications,
}) => {
  const t = translations[language];
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [myPlants, setMyPlants] = useState<PlantProfile[]>([]);
  const [reminders, setReminders] = useState<PlantCareReminder[]>([]);
  const today = getTodayDateString();

  useEffect(() => {
    async function loadData() {
      const scans = await db.getScans();
      setRecentScans(scans.slice(0, 3));
      const plants = await db.getPlants();
      setMyPlants(plants.slice(0, 4));
    }
    loadData();

    // Subscribe to reminders updates
    const unsubscribe = notificationService.subscribe((list) => {
      setReminders(list);
    });
    return unsubscribe;
  }, []);

  const handleMarkDone = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.playGardenChime();
    await db.markReminderDone(id);
    await notificationService.refreshReminders();
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'sun':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'fertilizer':
        return <FlaskConical className="w-4 h-4 text-purple-600" />;
      case 'prune':
        return <Scissors className="w-4 h-4 text-orange-600" />;
      case 'spray':
        return <Bug className="w-4 h-4 text-emerald-600" />;
      default:
        return <Search className="w-4 h-4 text-teal-600" />;
    }
  };

  const dueReminders = reminders.filter(
    (r) => !r.isCompletedToday && r.dueDate <= today
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 space-y-5">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        {/* Subtle decorative background foliage */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-12 -top-10 w-28 h-28 rounded-full bg-emerald-500/20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-emerald-100 text-xs font-semibold">
              <span>🌿</span>
              <span>{t.appSubtitle}</span>
            </div>

            <button
              onClick={onOpenNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold border border-white/20 transition-all shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-200" />
              <span>
                {dueReminders.length > 0
                  ? `${dueReminders.length} કાર્યો બાકી`
                  : 'રીમાઇન્ડર્સ'}
              </span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            નમસ્તે 👋
          </h1>
          <p className="text-sm text-emerald-100/90 font-medium max-w-md mb-5">
            {t.heroTagline}
          </p>

          {/* Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onOpenScanCamera}
              className="w-full py-3.5 px-4 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-98 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2.5 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span>{t.scanPlant}</span>
            </button>

            <button
              onClick={onOpenScanUpload}
              className="w-full py-3.5 px-4 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-white/20 active:scale-98 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{t.uploadPhoto}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: My Plants & Scan History */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('plants')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-3xl border border-emerald-100 shadow-2xs hover:shadow-sm text-left transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center justify-between">
              <span>{t.myPlants}</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {myPlants.length} છોડ સાચવેલ છે
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('history')}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-3xl border border-emerald-100 shadow-2xs hover:shadow-sm text-left transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center justify-between">
              <span>{t.scanHistory}</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              અગાઉના સ્કેન રિપોર્ટ્સ
            </p>
          </div>
        </button>
      </div>

      {/* Today's Care Reminders Card (Live Dynamic from Database) */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t.careReminders}</span>
            </h3>
            {dueReminders.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full animate-pulse">
                {dueReminders.length} આજે બાકી
              </span>
            )}
          </div>

          <button
            onClick={onOpenNotifications}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
          >
            <span>સંપૂર્ણ શેડ્યૂલ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dueReminders.length === 0 ? (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">આજે બધા કાર્યો પૂર્ણ થઈ ગયા છે! 🌱</p>
                <p className="text-[11px] text-emerald-700">
                  આવતીકાલના રીમાઇન્ડર્સ જોવા શેડ્યૂલ ખોલો.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenNotifications}
              className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-full font-bold text-[11px] shadow-2xs"
            >
              જુઓ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {dueReminders.slice(0, 3).map((rem) => (
              <div
                key={rem.id}
                onClick={onOpenNotifications}
                className="p-3 rounded-2xl bg-stone-50/80 hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 text-xs flex flex-col justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getTaskIcon(rem.taskType)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="font-bold text-stone-900 truncate">
                      {rem.plantName}
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium truncate">
                      {rem.title}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {rem.dueTime || 'આજે'}
                  </span>
                  <button
                    onClick={(e) => handleMarkDone(rem.id, e)}
                    className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold shadow-2xs flex items-center gap-1 active:scale-95"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Plants Quick Horizontal Strip */}
      {myPlants.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{t.myPlants}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('plants')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>બધા જુઓ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {myPlants.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigateTab('plants')}
                className="bg-white rounded-2xl p-2.5 border border-emerald-100 hover:border-emerald-300 shadow-2xs cursor-pointer transition-all flex flex-col items-center text-center"
              >
                <img
                  src={p.coverImage}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover mb-2 border border-stone-200"
                />
                <h4 className="font-bold text-xs text-stone-900 truncate w-full">
                  {p.name}
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  સ્કોર: {p.latestHealthScore}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scans List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <span>{t.recentScans}</span>
          </h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>બધા જુઓ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-dashed border-stone-300 text-center text-xs text-stone-500">
            {t.noScansYet}
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="bg-white rounded-2xl p-3 border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {scan.images[0] && (
                      <img
                        src={scan.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-stone-900">
                      {scan.analysis.plant.name_gu}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {scan.analysis.plant.name_en}
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {scan.dateFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      scan.analysis.health.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : scan.analysis.health.score >= 65
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {scan.analysis.health.score}/100
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
