import React, { useState, useEffect } from 'react';
import { Language, PlantAnalysisResult, ScanRecord, PlantProfile } from './types/plant';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { ScannerModal } from './components/ScannerModal';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ReportView } from './components/ReportView';
import { MyPlantsView } from './components/MyPlantsView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { NotificationModal } from './components/NotificationModal';
import { db, getTodayDateString } from './services/storageService';
import { notificationService } from './services/notificationService';
import { translations } from './i18n/translations';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('gu');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetPlantId, setTargetPlantId] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadRemindersCount, setUnreadRemindersCount] = useState(0);

  // Active Report State
  const [currentReport, setCurrentReport] = useState<{
    analysis: PlantAnalysisResult;
    images: string[];
    scanId?: string;
    isSaved: boolean;
  } | null>(null);
  const [reportHistoricalScans, setReportHistoricalScans] = useState<ScanRecord[]>([]);

  // Error toast
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[language];

  // Subscribe to reminders for header badge count
  useEffect(() => {
    const today = getTodayDateString();
    const unsubscribe = notificationService.subscribe((list) => {
      const pending = list.filter((r) => !r.isCompletedToday && r.dueDate <= today);
      setUnreadRemindersCount(pending.length);
    });
    return unsubscribe;
  }, []);

  // Open scanner with camera
  const handleOpenScanner = (plantId?: string) => {
    setTargetPlantId(plantId || null);
    setIsScannerOpen(true);
  };

  // Analyze Captured Photos
  const handleAnalyzePhotos = async (
    photos: Array<{ data: string; label: string }>
  ) => {
    setIsScannerOpen(false);
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: photos,
          language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            'છોડના વિશ્લેષણમાં સમસ્યા આવી. કૃપા કરીને વધુ પ્રકાશમાં સ્પષ્ટ ફોટો લો.'
        );
      }

      const result: PlantAnalysisResult = await response.json();

      // Check if comparing against a previous scan of this plant
      let comparisonNote: string | undefined;
      let pastScansForTrend: ScanRecord[] = [];
      if (targetPlantId) {
        const pastScans = await db.getScansByPlantId(targetPlantId);
        pastScansForTrend = pastScans;
        if (pastScans.length > 0) {
          const lastScan = pastScans[pastScans.length - 1];
          const prevScore = lastScan.analysis.health.score;
          const currScore = result.health.score;
          const diff = currScore - prevScore;
          if (diff > 0) {
            comparisonNote = `છેલ્લા સ્કેન (${prevScore}) ની સરખામણીએ આરોગ્ય +${diff} પોઇન્ટ સુધર્યું છે! 🌱`;
          } else if (diff < 0) {
            comparisonNote = `ધ્યાન આપો: છેલ્લા સ્કેન (${prevScore}) ની સરખામણીએ આરોગ્ય ${diff} પોઇન્ટ ઘટ્યું છે. સારવાર તરત શરૂ કરો. ⚠️`;
          } else {
            comparisonNote = `આરોગ્ય સ્કોર અગાઉના સ્કેન જેટલો જ સ્થિર (${currScore}/100) છે.`;
          }
          result.comparison_note = comparisonNote;
        }
      }

      const scanId = `scan-${Date.now()}`;
      const imageList = photos.map((p) => p.data);

      const record: ScanRecord = {
        id: scanId,
        plantId: targetPlantId || undefined,
        timestamp: Date.now(),
        dateFormatted: new Date().toLocaleDateString('gu-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        images: imageList,
        analysis: result,
      };

      // Save scan to database
      await db.saveScan(record);

      setReportHistoricalScans([...pastScansForTrend, record]);
      setCurrentReport({
        analysis: result,
        images: imageList,
        scanId,
        isSaved: !!targetPlantId,
      });

      setActiveTab('home'); // or keep in report mode
    } catch (err: any) {
      console.error('Plant analysis failed:', err);
      setErrorMessage(
        err.message ||
          '📷 ફોટો પૂરતો સ્પષ્ટ નથી અથવા વિશ્લેષણમાં ભૂલ આવી. કૃપા કરીને વધુ પ્રકાશમાં પાનનો close-up ફોટો લો.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save current report to My Plants
  const handleSaveToMyPlants = async () => {
    if (!currentReport) return;

    const newPlant: PlantProfile = {
      id: `plant-${Date.now()}`,
      name: currentReport.analysis.plant.name_gu,
      nickname: currentReport.analysis.plant.name_en,
      species: currentReport.analysis.plant.scientific_name,
      category: currentReport.analysis.plant.category,
      coverImage:
        currentReport.images[0] ||
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      createdAt: Date.now(),
      location: 'balcony',
      latestHealthScore: currentReport.analysis.health.score,
      lastScanDate: new Date().toLocaleDateString(),
      scansCount: 1,
      notes: currentReport.analysis.health.summary,
    };

    await db.savePlant(newPlant);

    // Automatically generate watering & care schedule reminders from this scan
    await db.generateRemindersFromScan(
      newPlant.id,
      newPlant.name,
      newPlant.coverImage,
      currentReport.analysis
    );
    await notificationService.refreshReminders();

    // Link this scan with the newly created plant profile
    if (currentReport.scanId) {
      const scan = await db.getScanById(currentReport.scanId);
      if (scan) {
        scan.plantId = newPlant.id;
        await db.saveScan(scan);
      }
    }

    setCurrentReport((prev) => (prev ? { ...prev, isSaved: true } : null));
  };

  const handleSelectHistoricalScan = async (scan: ScanRecord) => {
    let scansList: ScanRecord[] = [];
    if (scan.plantId) {
      scansList = await db.getScansByPlantId(scan.plantId);
    } else {
      scansList = [scan];
    }
    setReportHistoricalScans(scansList);
    setCurrentReport({
      analysis: scan.analysis,
      images: scan.images,
      scanId: scan.id,
      isSaved: true,
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Header */}
      <Header
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onNavigateHome={() => {
          setCurrentReport(null);
          setActiveTab('home');
        }}
        onOpenScan={() => handleOpenScanner()}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Error Notification Toast */}
        {errorMessage && (
          <div className="max-w-xl mx-auto px-4 pt-3">
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {currentReport ? (
          <div className="pt-2">
            <div className="max-w-3xl mx-auto px-4 flex items-center justify-between mb-1">
              <button
                onClick={() => setCurrentReport(null)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 py-1 px-3 rounded-full bg-white border border-stone-200 shadow-2xs transition-colors"
              >
                ← પાછા ડેશબોર્ડ પર (Dashboard)
              </button>
            </div>
            <ReportView
              analysis={currentReport.analysis}
              images={currentReport.images}
              language={language}
              onScanAgain={() => handleOpenScanner(targetPlantId || undefined)}
              onSaveToMyPlants={handleSaveToMyPlants}
              isSaved={currentReport.isSaved}
              historicalScans={reportHistoricalScans}
            />
          </div>
        ) : activeTab === 'home' ? (
          <HomeDashboard
            language={language}
            onOpenScanCamera={() => handleOpenScanner()}
            onOpenScanUpload={() => handleOpenScanner()}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectScan={handleSelectHistoricalScan}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
          />
        ) : activeTab === 'plants' ? (
          <MyPlantsView
            language={language}
            onOpenScanForPlant={(plantId) => handleOpenScanner(plantId)}
            onViewScan={handleSelectHistoricalScan}
          />
        ) : (
          <ScanHistoryView
            language={language}
            onSelectScan={handleSelectHistoricalScan}
            onOpenScan={() => handleOpenScanner()}
          />
        )}
      </main>

      {/* Camera & Image Upload Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAnalyze={handleAnalyzePhotos}
        language={language}
      />

      {/* Multi-step AI Vision Progress Loading Screen */}
      {isAnalyzing && <AnalysisLoading language={language} />}

      {/* Local Watering and Care Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        language={language}
      />

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'scan') {
            handleOpenScanner();
          } else {
            setCurrentReport(null);
            setActiveTab(tab);
          }
        }}
        language={language}
      />
    </div>
  );
}
