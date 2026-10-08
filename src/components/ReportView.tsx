import React, { useState } from 'react';
import {
  PlantAnalysisResult,
  Language,
  ScanRecord,
} from '../types/plant';
import { translations } from '../i18n/translations';
import { HealthScoreGauge } from './HealthScoreGauge';
import { AudioPlayerButton } from './AudioPlayerButton';
import { PlantChat } from './PlantChat';
import { HealthTrendChart } from './HealthTrendChart';
import {
  Sprout,
  ShieldAlert,
  Bug,
  Droplet,
  Sun,
  Layers,
  FlaskConical,
  Pill,
  Sparkles,
  Calendar,
  BookmarkCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Share2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ReportViewProps {
  analysis: PlantAnalysisResult;
  images: string[];
  language: Language;
  onScanAgain: () => void;
  onSaveToMyPlants: () => void;
  isSaved?: boolean;
  historicalScans?: ScanRecord[];
}

export const ReportView: React.FC<ReportViewProps> = ({
  analysis,
  images,
  language,
  onScanAgain,
  onSaveToMyPlants,
  isSaved = false,
  historicalScans = [],
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'care' | 'trend' | 'chat'>('diagnosis');
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const toggleTask = (day: number) => {
    setCompletedTasks((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Compile key speech text for listen button
  const fullDoctorSummary = `
${analysis.plant.name_gu}. હેલ્થ સ્કોર ${analysis.health.score} છે. 
${analysis.health.summary}. 
${
  analysis.possible_diseases.length > 0
    ? `શંકાસ્પદ રોગ: ${analysis.possible_diseases[0].name}.`
    : 'છોડમાં કોઈ મોટો રોગ જણાતો નથી.'
}
${analysis.treatment.immediate_actions.slice(0, 2).join('. ')}.
  `;

  return (
    <div className="max-w-3xl mx-auto pb-24 px-3 sm:px-4 pt-3 space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-emerald-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <AudioPlayerButton textToSpeak={fullDoctorSummary} language={language} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToMyPlants}
            disabled={isSaved}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>{isSaved ? t.savedSuccessfully : t.savePlant}</span>
          </button>

          <button
            onClick={onScanAgain}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            title={t.scanAgain}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison alert banner if re-scanned */}
      {analysis.comparison_note && (
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-sm flex items-center gap-2.5 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>{analysis.comparison_note}</span>
        </div>
      )}

      {/* Hero Plant Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Plant Photo Thumbnail */}
          {images && images.length > 0 && (
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-sm shrink-0 border-2 border-emerald-100">
              <img
                src={images[0]}
                alt={analysis.plant.name_gu}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                સ્કેન કરેલ
              </span>
            </div>
          )}

          {/* Plant Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {analysis.plant.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600">
                {analysis.plant.confidence}% Confidence
              </span>
              {analysis.plant.is_possible_only && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  Possible Identification
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {analysis.plant.name_gu}
            </h1>
            <p className="text-sm font-semibold text-emerald-700">
              {analysis.plant.name_en}
            </p>
            <p className="text-xs italic text-stone-600 font-serif">
              {analysis.plant.scientific_name}
            </p>

            <p className="text-xs text-stone-600 mt-2.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
              {analysis.health.summary}
            </p>
          </div>

          {/* Health Gauge */}
          <div className="shrink-0 pt-1">
            <HealthScoreGauge
              score={analysis.health.score}
              status={analysis.health.status}
              statusText={analysis.health.status_text}
              confidence={analysis.health.confidence}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Main Tabs (Diagnosis, Care Plan, Chat) */}
      <div className="flex bg-stone-200/80 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('diagnosis')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'diagnosis'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🩺 {t.healthTitle} & રોગ
        </button>
        <button
          onClick={() => setActiveTab('care')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'care'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📅 {t.careCalendar}
        </button>
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'trend'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📈 {t.healthTrend}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          💬 AI ડૉક્ટર
        </button>
      </div>

      {/* TAB 1: DIAGNOSIS & COMPLETE REPORT */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-4">
          {/* 1. VISUAL SYMPTOMS CARD */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>{t.symptomsTitle}</span>
              </h3>
              <span className="text-[11px] text-stone-600 font-medium">
                દેખાતી સાબિતી vs અનુમાન
              </span>
            </div>

            <div className="space-y-2">
              {analysis.visual_symptoms && analysis.visual_symptoms.length > 0 ? (
                analysis.visual_symptoms.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        s.severity === 'high'
                          ? 'bg-red-500'
                          : s.severity === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{s.symptom}</p>
                      <span className="text-[10px] text-stone-600">
                        {s.is_visible_fact
                          ? '✓ ફોટોમાં સીધું દેખાય છે'
                          : 'ℹ️ લક્ષણ આધારિત અનુમાન'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-600 italic">
                  કોઈ અસામાન્ય બાહ્ય લક્ષણ દેખાતું નથી.
                </p>
              )}
            </div>
          </div>

          {/* 2. DISEASE DETECTION CARD */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-red-100 text-red-700">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <span>{t.diseaseTitle}</span>
              </h3>
            </div>

            {analysis.possible_diseases && analysis.possible_diseases.length > 0 ? (
              <div className="space-y-3">
                {analysis.possible_diseases.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-red-900">{d.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-red-200/80 text-red-800 text-[10px] font-bold">
                        સંભાવના: {d.probability}%
                      </span>
                    </div>

                    <p className="text-stone-700">
                      <strong>AI કારણ:</strong> {d.why_suspected}
                    </p>

                    <div className="bg-white p-2.5 rounded-xl border border-red-100">
                      <strong className="text-red-800 block mb-0.5">
                        આગામી પગલું (Next Step):
                      </strong>
                      <span className="text-stone-700">{d.recommended_action}</span>
                    </div>

                    {d.disclaimer && (
                      <p className="text-[10px] text-stone-600 italic">
                        ⚠️ {d.disclaimer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>કોઈ ગંભીર રોગના ચિહ્નો મળ્યા નથી. છોડ સુરક્ષિત જણાય છે.</span>
              </div>
            )}
          </div>

          {/* 3. PEST DETECTION CARD */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 mb-3">
              <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                <Bug className="w-4 h-4" />
              </span>
              <span>{t.pestTitle}</span>
            </h3>

            {analysis.possible_pests &&
            analysis.possible_pests.length > 0 &&
            analysis.possible_pests.some((p) => p.probability > 30) ? (
              <div className="space-y-3">
                {analysis.possible_pests.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-950">{p.name}</span>
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold">
                        {p.probability}%
                      </span>
                    </div>
                    <p className="text-stone-700">
                      <strong>પ્રત્યક્ષ સાબિતી:</strong> {p.visible_evidence}
                    </p>
                    {p.management && p.management.length > 0 && (
                      <div className="mt-1 bg-white p-2 rounded-xl border border-amber-100 text-stone-700">
                        <strong>નિયંત્રણ:</strong> {p.management.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  ફોટામાં કોઈ જીવાત (Pest/Insects) દેખાતી નથી. છોડ જીવાત-મુક્ત લાગે છે.
                </span>
              </div>
            )}
          </div>

          {/* 4. NUTRIENT ANALYSIS */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 mb-3">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <FlaskConical className="w-4 h-4" />
              </span>
              <span>{t.nutritionTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.nutrient_issues && analysis.nutrient_issues.length > 0 ? (
                analysis.nutrient_issues.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border bg-stone-50/70 border-stone-200/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-800">{n.nutrient}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.status === 'normal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : n.status === 'deficiency'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {n.status === 'normal'
                          ? 'સામાન્ય (Normal)'
                          : n.status === 'deficiency'
                          ? 'સંભવિત અછત'
                          : 'અનિશ્ચિત'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">{n.explanation}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">
                  પોષક તત્વોની વિગતો ઉપલબ્ધ નથી.
                </p>
              )}
            </div>

            <p className="text-[10px] text-stone-600 mt-3 italic">
              ℹ️ નોંધ: ફક્ત પાનના ફોટાથી nutrient deficiencyનું લેબોરેટરી જેવું નિશ્ચિત
              નિદાન થઈ શકતું નથી.
            </p>
          </div>

          {/* 5. WATER, SUNLIGHT, SOIL GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Water */}
            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-xs mb-2">
                  <Droplet className="w-4 h-4" />
                  <span>{t.waterTitle}</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 mb-1">
                  {analysis.watering.advice}
                </p>
                <p className="text-[11px] text-stone-600 mb-2">
                  આવર્તન: {analysis.watering.frequency_suggestion}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[10px] text-blue-900 font-medium">
                👉 {analysis.watering.check_advice}
              </div>
            </div>

            {/* Sunlight */}
            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-xs mb-2">
                  <Sun className="w-4 h-4" />
                  <span>{t.sunlightTitle}</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 mb-1">
                  {analysis.sunlight.requirement}
                </p>
                <p className="text-[11px] text-stone-600 mb-2">
                  સમય: {analysis.sunlight.hours_per_day}
                </p>
              </div>
              <p className="text-[10px] text-stone-600">{analysis.sunlight.advice}</p>
            </div>

            {/* Soil */}
            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-stone-700 font-extrabold text-xs mb-2">
                  <Layers className="w-4 h-4" />
                  <span>{t.soilTitle}</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 mb-1">
                  {analysis.soil.preferred_type}
                </p>
                <p className="text-[11px] text-stone-600 mb-2">
                  pH શ્રેણી: {analysis.soil.ph_range}
                </p>
              </div>
              <p className="text-[10px] text-stone-600 italic">
                ℹ️ {analysis.soil.note}
              </p>
            </div>
          </div>

          {/* 6. FERTILIZER & NUTRITION CARD */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 mb-3">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <FlaskConical className="w-4 h-4" />
              </span>
              <span>{t.fertilizerTitle}</span>
            </h3>

            <div className="space-y-2.5 text-xs text-stone-800">
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-950 block mb-0.5">
                  જૈવિક દેશી ખાતર (Organic Compost):
                </span>
                <span>{analysis.fertilizer.organic_compost}</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-950 block mb-0.5">
                  અળસિયાનું ખાતર (Vermicompost):
                </span>
                <span>{analysis.fertilizer.vermicompost}</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-0.5">
                  સામાન્ય NPK પોષણ:
                </span>
                <span>{analysis.fertilizer.general_npk}</span>
              </div>

              {analysis.fertilizer.precautions && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <span className="font-bold block">⚠️ સલામતી સાવચેતી:</span>
                  {analysis.fertilizer.precautions.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. TREATMENT PLAN IN 3 PARTS */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-600 text-white">
                  <Pill className="w-5 h-5" />
                </span>
                <span>{t.treatmentTitle}</span>
              </h3>
              <AudioPlayerButton
                textToSpeak={`સારવાર યોજના: તરત શું કરવું: ${analysis.treatment.immediate_actions.join(
                  '. '
                )}. કુદરતી ઉપાય: ${analysis.treatment.organic_remedies.join(
                  '. '
                )}. ભવિષ્યમાં બચાવ: ${analysis.treatment.prevention.join('. ')}`}
                language={language}
              />
            </div>

            <div className="space-y-4">
              {/* Part 1: Immediate Action */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 className="font-extrabold text-xs text-amber-950 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                    ૧
                  </span>
                  <span>{t.immediateAction}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-800 pl-6 list-disc">
                  {analysis.treatment.immediate_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Part 2: Natural / Organic Remedies */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-extrabold text-xs text-emerald-950 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ૨
                  </span>
                  <span>{t.organicRemedy}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-800 pl-6 list-disc">
                  {analysis.treatment.organic_remedies.map((rem, i) => (
                    <li key={i}>{rem}</li>
                  ))}
                </ul>
              </div>

              {/* Part 3: Long-term Prevention */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-extrabold text-xs text-stone-900 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-700 text-white flex items-center justify-center text-[10px]">
                    ૩
                  </span>
                  <span>{t.prevention}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-800 pl-6 list-disc">
                  {analysis.treatment.prevention.map((prev, i) => (
                    <li key={i}>{prev}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 8. AI REASONING / EXPLANATION CARD */}
          <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200/80">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>{t.whyAiSaidThis}</span>
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed mb-3">
              {analysis.doctor_explanation.why_diagnosed}
            </p>

            {analysis.doctor_explanation.visual_clues && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {analysis.doctor_explanation.visual_clues.map((clue, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white rounded-lg border border-stone-200 text-[11px] text-stone-700 font-medium"
                  >
                    🔍 {clue}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[11px] text-stone-500 italic">
              {analysis.doctor_explanation.uncertainty_notes}
            </p>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>{t.disclaimer}</span>
          </div>
        </div>
      )}

      {/* TAB 2: CARE CALENDAR & REMINDERS */}
      {activeTab === 'care' && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>{t.careCalendar} (આગામી ૭ દિવસ)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                તમારા છોડના ઝડપી રિકવરી માટે AI દ્વારા બનાવેલ સંભાળ યોજના
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {analysis.care_calendar_preview &&
              analysis.care_calendar_preview.map((task) => {
                const isDone = completedTasks[task.day];
                return (
                  <div
                    key={task.day}
                    onClick={() => toggleTask(task.day)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 opacity-80'
                        : 'bg-stone-50/70 border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <button
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-stone-300 bg-white'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                          દિવસ {task.day}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-stone-500' : 'text-stone-800'
                          }`}
                        >
                          {task.task}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH TREND CHART (RECHARTS) */}
      {activeTab === 'trend' && (
        <HealthTrendChart
          scans={
            historicalScans && historicalScans.length > 0
              ? historicalScans
              : [
                  {
                    id: 'current-scan',
                    timestamp: Date.now(),
                    dateFormatted: 'આજે (Today)',
                    images,
                    analysis,
                  },
                ]
          }
          plantName={analysis.plant.name_gu}
        />
      )}

      {/* TAB 4: GUJARATI AI CHAT */}
      {activeTab === 'chat' && (
        <PlantChat analysis={analysis} language={language} />
      )}
    </div>
  );
};
