import React, { useState, useEffect } from 'react';
import { PlantProfile, ScanRecord, Language } from '../types/plant';
import { db } from '../services/storageService';
import { translations } from '../i18n/translations';
import { HealthTrendChart } from './HealthTrendChart';
import {
  Sprout,
  Plus,
  Calendar,
  HeartPulse,
  Trash2,
  ChevronRight,
  Camera,
  MapPin,
  FileText,
  X,
  History,
} from 'lucide-react';

interface MyPlantsViewProps {
  language: Language;
  onOpenScanForPlant: (plantId: string) => void;
  onViewScan: (scan: ScanRecord) => void;
}

export const MyPlantsView: React.FC<MyPlantsViewProps> = ({
  language,
  onOpenScanForPlant,
  onViewScan,
}) => {
  const t = translations[language];
  const [plants, setPlants] = useState<PlantProfile[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantProfile | null>(null);
  const [plantScans, setPlantScans] = useState<ScanRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Plant Form State
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newSpecies, setNewSpecies] = useState('');
  const [newCategory, setNewCategory] = useState('ઔષધીય છોડ (Medicinal)');
  const [newLocation, setNewLocation] = useState<'balcony' | 'garden' | 'indoor' | 'farm'>('balcony');
  const [newNotes, setNewNotes] = useState('');
  const [newCover, setNewCover] = useState(
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'
  );

  const loadPlants = async () => {
    const list = await db.getPlants();
    setPlants(list);
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleSelectPlant = async (plant: PlantProfile) => {
    setSelectedPlant(plant);
    const scans = await db.getScansByPlantId(plant.id);
    setPlantScans(scans);
  };

  const handleDeletePlant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('શું તમે આ છોડ પ્રોફાઇલ ડિલીટ કરવા માંગો છો?')) {
      await db.deletePlant(id);
      if (selectedPlant?.id === id) {
        setSelectedPlant(null);
      }
      loadPlants();
    }
  };

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPlant: PlantProfile = {
      id: `plant-${Date.now()}`,
      name: newName.trim(),
      nickname: newNickname.trim(),
      species: newSpecies.trim() || 'Botanical Species',
      category: newCategory,
      coverImage: newCover,
      createdAt: Date.now(),
      location: newLocation,
      latestHealthScore: 85,
      lastScanDate: new Date().toLocaleDateString(),
      scansCount: 0,
      notes: newNotes.trim(),
    };

    await db.savePlant(newPlant);
    setShowAddModal(false);
    setNewName('');
    setNewNickname('');
    setNewSpecies('');
    setNewNotes('');
    loadPlants();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>{t.myPlants}</span>
          </h2>
          <p className="text-xs text-stone-500">
            તમારા બધા સંગ્રહિત છોડની પ્રોફાઇલ અને આરોગ્ય પ્રગતિ
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewPlant}</span>
        </button>
      </div>

      {/* Detail Modal / Drawer if a plant is selected */}
      {selectedPlant ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlant(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-stone-200 w-fit"
          >
            ← પાછા જાઓ (All Plants)
          </button>

          {/* Plant Profile Card */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src={selectedPlant.coverImage}
                alt={selectedPlant.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl font-black text-stone-900">
                    {selectedPlant.name}
                  </h3>
                  {selectedPlant.nickname && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      "{selectedPlant.nickname}"
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-emerald-700">
                  {selectedPlant.species} • {selectedPlant.category}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    સ્થાન: {selectedPlant.location === 'balcony' ? 'ગેલેરી / બાલ્કની' : selectedPlant.location === 'garden' ? 'બગીચો' : selectedPlant.location === 'indoor' ? 'ઇન્ડોર' : 'ખેતર'}
                  </span>
                </p>
                {selectedPlant.notes && (
                  <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    {selectedPlant.notes}
                  </p>
                )}
              </div>

              {/* Quick Scan Action for this plant */}
              <div className="shrink-0 flex flex-col items-center">
                <button
                  onClick={() => onOpenScanForPlant(selectedPlant.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>નવો સ્કેન લો</span>
                </button>
              </div>
            </div>
          </div>

          {/* Plant Health Trend Recharts Chart */}
          <HealthTrendChart
            scans={plantScans}
            plantName={selectedPlant.name}
            onSelectScan={onViewScan}
          />

          {/* Associated Scans List */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-emerald-600" />
              <span>આ છોડના સ્કેન ઇતિહાસ ({plantScans.length})</span>
            </h4>

            {plantScans.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                હજુ સુધી આ છોડ માટે કોઈ સ્કેન સંગ્રહાયેલ નથી.
              </p>
            ) : (
              <div className="space-y-2">
                {plantScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => onViewScan(scan)}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {scan.images[0] && (
                        <img
                          src={scan.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">
                            {scan.dateFormatted}
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
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {scan.analysis.health.summary}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Plant Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {plants.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-8 border border-dashed border-stone-300 text-center">
              <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 mb-4">{t.noPlantsYet}</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold"
              >
                {t.addNewPlant}
              </button>
            </div>
          ) : (
            plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => handleSelectPlant(plant)}
                className="bg-white rounded-3xl p-4 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={plant.coverImage}
                      alt={plant.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {plant.name}
                        </h4>
                        <button
                          onClick={(e) => handleDeletePlant(plant.id, e)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Plant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-emerald-700 truncate">
                        {plant.species}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full mt-1">
                        {plant.category}
                      </span>
                    </div>
                  </div>

                  {plant.notes && (
                    <p className="text-[11px] text-stone-600 line-clamp-2 bg-stone-50 p-2 rounded-xl border border-stone-200/50 mb-3">
                      {plant.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-stone-800">
                      સ્કોર: {plant.latestHealthScore}/100
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                    <span>પ્રોફાઇલ જુઓ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add New Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>{t.addNewPlant}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  છોડનું નામ (Plant Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત., મારી તુલસી, દેશી ગુલાબ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  ઉપનામ (Nickname - Optional)
                </label>
                <input
                  type="text"
                  placeholder="દા.ત., લીલી, રાધા"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    પ્રકાર (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="ઔષધીય છોડ (Medicinal)">ઔષધીય છોડ</option>
                    <option value="બગીચાનું ફૂલ (Flowering)">બગીચાનું ફૂલ</option>
                    <option value="શાકભાજી પાક (Vegetable)">શાકભાજી પાક</option>
                    <option value="ઇન્ડોર પ્લાન્ટ (Indoor)">ઇન્ડોર પ્લાન્ટ</option>
                    <option value="ફળ પાક (Fruit)">ફળ પાક</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    સ્થાન (Location)
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="balcony">ગેલેરી / બાલ્કની</option>
                    <option value="garden">બગીચો (Garden)</option>
                    <option value="indoor">ઘરની અંદર (Indoor)</option>
                    <option value="farm">ખેતર (Farm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  નોંધ (Notes / સંભાળ વિગતો)
                </label>
                <textarea
                  rows={2}
                  placeholder="કૂંડાનું કદ, માટીનો પ્રકાર, ખાતર આપવાની તારીખ વગેરે..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  સાચવો (Save Plant)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
