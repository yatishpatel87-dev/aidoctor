import React, { useState, useEffect } from 'react';
import { ScanRecord, Language } from '../types/plant';
import { db } from '../services/storageService';
import { translations } from '../i18n/translations';
import {
  History,
  Search,
  Trash2,
  ChevronRight,
  HeartPulse,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ScanHistoryViewProps {
  language: Language;
  onSelectScan: (scan: ScanRecord) => void;
  onOpenScan: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  language,
  onSelectScan,
  onOpenScan,
}) => {
  const t = translations[language];
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'issue'>('all');

  const loadScans = async () => {
    const list = await db.getScans();
    setScans(list);
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('શું તમે આ સ્કેન હિસ્ટ્રીમાંથી ડિલીટ કરવા માંગો છો?')) {
      await db.deleteScan(id);
      loadScans();
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.analysis.plant.name_gu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.analysis.plant.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.dateFormatted.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'healthy') {
      return scan.analysis.health.score >= 80;
    }
    if (statusFilter === 'issue') {
      return scan.analysis.health.score < 80;
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Top Title & Quick Action */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>{t.scanHistory}</span>
          </h2>
          <p className="text-xs text-stone-500">
            તમારા બધા અગાઉના છોડ નિદાન અને વિગતવાર રિપોર્ટ્સ
          </p>
        </div>

        <button
          onClick={onOpenScan}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          + નવો સ્કેન
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-2xs mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="છોડનું નામ અથવા તારીખ શોધો..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            બધા ({scans.length})
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'healthy'
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            તંદુરસ્ત
          </button>
          <button
            onClick={() => setStatusFilter('issue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'issue'
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            સમસ્યા વાળા
          </button>
        </div>
      </div>

      {/* Scans List */}
      <div className="space-y-3">
        {filteredScans.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-stone-300 text-center">
            <History className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-500 mb-4">{t.noScansYet}</p>
            <button
              onClick={onOpenScan}
              className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold"
            >
              {t.scanPlant}
            </button>
          </div>
        ) : (
          filteredScans.map((scan) => {
            const hasDisease =
              scan.analysis.possible_diseases &&
              scan.analysis.possible_diseases.length > 0;
            const diseaseName = hasDisease
              ? scan.analysis.possible_diseases[0].name
              : 'કોઈ રોગ નથી (Healthy)';

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="bg-white rounded-3xl p-4 border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {scan.images && scan.images[0] ? (
                      <img
                        src={scan.images[0]}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        🌱
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-stone-600 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{scan.dateFormatted}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          scan.analysis.health.score >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : scan.analysis.health.score >= 65
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        સ્કોર: {scan.analysis.health.score}/100
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-stone-900 truncate">
                      {scan.analysis.plant.name_gu}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-700 truncate">
                      {scan.analysis.plant.name_en}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1">
                      {hasDisease ? (
                        <span className="text-[10px] text-red-700 font-semibold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md">
                          <ShieldAlert className="w-3 h-3" />
                          <span className="truncate">{diseaseName}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>તંદુરસ્ત સ્થિતિ</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(scan.id, e)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
