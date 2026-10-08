import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Sparkles,
  SwitchCamera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Language } from '../types/plant';
import { translations } from '../i18n/translations';

interface CapturedPhoto {
  data: string; // base64
  label: string;
}

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (images: CapturedPhoto[]) => void;
  language: Language;
}

// Demo samples for quick evaluation
const DEMO_SAMPLES = [
  {
    title: 'ટામેટા (Leaf Spot & Yellowing)',
    label: 'અસરગ્રસ્ત ટામેટીનું પાન',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'તુલસી (Healthy Green)',
    label: 'તંદુરસ્ત તુલસીનો છોડ',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'ગુલાબ (Rose Mildew / Spot)',
    label: 'ગુલાબનું પાન અને કળી',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'મરચી (Leaf Curl / થ્રીપ્સ)',
    label: 'મરચીના વળેલા પાન',
    url: 'https://images.unsplash.com/photo-1588879462719-755490710609?auto=format&fit=crop&w=800&q=80',
  },
];

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  language,
}) => {
  const t = translations[language];
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const photoLabels = [
    t.photoTip1, // ૧. આખા છોડનો ફોટો
    t.photoTip2, // ૨. અસરગ્રસ્ત પાનનો close-up
    t.photoTip3, // ૩. ફૂલ / ફળ / ડાંડીનો close-up
  ];

  // Initialize or stop camera stream
  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, cameraFacing]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('કેમેરા શરૂ થઈ શક્યો નથી. કૃપા કરીને ગેલેરીથી ફોટો અપલોડ કરો.');
      setActiveMode('upload');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const nextLabel = photoLabels[photos.length] || `Photo ${photos.length + 1}`;
    setPhotos((prev) => [...prev, { data: dataUrl, label: nextLabel }]);
  };

  // Handle file uploads from gallery
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const nextLabel =
            photoLabels[photos.length + index] || `Photo ${photos.length + index + 1}`;
          setPhotos((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, { data: dataUrl, label: nextLabel }];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDemoSelect = async (demo: (typeof DEMO_SAMPLES)[0]) => {
    try {
      // Fetch image and convert to base64
      const res = await fetch(demo.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setPhotos([{ data: base64data, label: demo.label }]);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Demo load failed', err);
    }
  };

  const handleStartAnalysis = () => {
    if (photos.length === 0) return;
    stopCamera();
    onAnalyze(photos);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="font-extrabold text-base leading-tight">
                {t.scanPlant}
              </h2>
              <p className="text-[11px] text-emerald-200">{t.cameraGuide}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'camera'
                ? 'bg-white text-emerald-800 border-t border-x border-stone-200 shadow-2xs'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.camera}</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'upload'
                ? 'bg-white text-emerald-800 border-t border-x border-stone-200 shadow-2xs'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t.gallery}</span>
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeMode === 'camera' ? (
            <div className="relative rounded-2xl overflow-hidden bg-stone-900 aspect-4/3 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Guide Overlay Frame */}
              <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                </div>
                <div className="text-center bg-stone-900/60 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 rounded-full mx-auto shadow-md">
                  🍃 {t.cameraGuide}
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                </div>
              </div>

              {/* Camera Switch button */}
              <button
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/60 text-white hover:bg-stone-900/80 transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              {/* Capture Trigger Button */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center">
                <button
                  onClick={captureFrame}
                  disabled={photos.length >= 3}
                  className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-xl flex items-center justify-center text-white transition-all disabled:opacity-50"
                  title="Capture Photo"
                >
                  <Camera className="w-7 h-7" />
                </button>
              </div>
            </div>
          ) : (
            /* Upload Mode */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-stone-800 mb-1">
                  {t.uploadPhoto}
                </h4>
                <p className="text-xs text-stone-500 mb-3 max-w-xs">
                  ગેલેરીમાંથી છોડ, પાન કે ડાંડીનો ફોટો પસંદ કરો (મહત્તમ ૩ ફોટો)
                </p>
                <span className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs">
                  {t.gallery}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />
              </div>

              {/* Instant Test Samples */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>અથવા ટેસ્ટિંગ માટે તૈયાર સેમ્પલ પસંદ કરો:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_SAMPLES.map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDemoSelect(demo)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all"
                    >
                      <img
                        src={demo.url}
                        alt={demo.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-stone-800 truncate">
                          {demo.title}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate">
                          ક્લિક કરી લોડ કરો
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* 3 Photo Slots Guidance */}
          <div className="mt-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3">
            <h5 className="font-bold text-xs text-emerald-950 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.photoTipsTitle}</span>
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((slotIdx) => {
                const photo = photos[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`relative rounded-xl border-2 p-1.5 flex flex-col items-center text-center transition-all ${
                      photo
                        ? 'border-emerald-500 bg-white shadow-xs'
                        : 'border-dashed border-stone-300 bg-stone-50/60'
                    }`}
                  >
                    {photo ? (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1">
                        <img
                          src={photo.data}
                          alt={`Slot ${slotIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(slotIdx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-xs"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-stone-100 flex flex-col items-center justify-center text-stone-400 mb-1">
                        <span className="text-xs font-bold">#{slotIdx + 1}</span>
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-stone-700 line-clamp-1">
                      {slotIdx === 0
                        ? 'આખો છોડ'
                        : slotIdx === 1
                        ? 'અસરગ્રસ્ત પાન'
                        : 'ડાંડી/ફળ'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => setPhotos([])}
            disabled={photos.length === 0}
            className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.retake}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-semibold"
            >
              {t.cancel}
            </button>

            <button
              onClick={handleStartAnalysis}
              disabled={photos.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {t.analyze} ({photos.length})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
