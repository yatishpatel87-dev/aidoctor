import React, { useEffect, useState } from 'react';
import { Camera, Sprout, HeartPulse, Bug, ShieldAlert, Pill, FileText, CheckCircle2 } from 'lucide-react';
import { Language } from '../types/plant';
import { translations } from '../i18n/translations';

interface AnalysisLoadingProps {
  language: Language;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ language }) => {
  const t = translations[language];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { label: t.analyzingSteps.image, icon: Camera },
    { label: t.analyzingSteps.identifying, icon: Sprout },
    { label: t.analyzingSteps.health, icon: HeartPulse },
    { label: t.analyzingSteps.disease, icon: ShieldAlert },
    { label: t.analyzingSteps.pest, icon: Bug },
    { label: t.analyzingSteps.treatment, icon: Pill },
    { label: t.analyzingSteps.final, icon: FileText },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1300);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Botanical Pulse Icon */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
            <Sprout className="w-10 h-10 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-stone-900 mb-2">
          🔬 {t.analyzingPlant}
        </h3>
        <p className="text-xs text-stone-500 mb-6">
          કૃપા કરીને રાહ જુઓ, AI મોડેલ પાંદડા અને છોડનું સૂક્ષ્મ વિશ્લેષણ કરી રહ્યું છે...
        </p>

        {/* Stepper List */}
        <div className="w-full space-y-2.5 text-left mb-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-xs scale-[1.02]'
                    : isDone
                    ? 'bg-stone-50 border-stone-200 text-stone-700 font-medium'
                    : 'opacity-40 border-transparent text-stone-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? 'bg-emerald-600 text-white animate-spin'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="flex-1">{step.label}</span>
                {isCurrent && (
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                    ચાલુ છે...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Reassuring Note */}
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2 text-left">
          <span>💡</span>
          <span>
            સચોટતા વધારવા માટે AI માત્ર ફોટાના આધારે સાવચેત તબીબી વિશ્લેષણ પૂરું પાડે છે.
          </span>
        </div>
      </div>
    </div>
  );
};
