import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Square, Loader2 } from 'lucide-react';
import { tts } from '../services/ttsService';
import { Language } from '../types/plant';
import { translations } from '../i18n/translations';

interface AudioPlayerButtonProps {
  textToSpeak: string;
  language: Language;
  className?: string;
  compact?: boolean;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  textToSpeak,
  language,
  className = '',
  compact = false,
}) => {
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing' | 'paused'>(
    tts.getState()
  );
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const unsubscribe = tts.subscribe((state) => {
      setTtsState(state);
      if (state === 'idle') {
        setIsCurrentSpeaker(false);
      }
    });
    return unsubscribe;
  }, []);

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCurrentSpeaker) {
      if (ttsState === 'playing') {
        tts.pause();
      } else if (ttsState === 'paused') {
        tts.resume();
      } else {
        setIsCurrentSpeaker(true);
        await tts.speak(textToSpeak, language);
      }
    } else {
      setIsCurrentSpeaker(true);
      await tts.speak(textToSpeak, language);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    tts.stop();
    setIsCurrentSpeaker(false);
  };

  const isPlayingThis = isCurrentSpeaker && ttsState === 'playing';
  const isPausedThis = isCurrentSpeaker && ttsState === 'paused';
  const isLoadingThis = isCurrentSpeaker && ttsState === 'loading';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          onClick={handlePlayToggle}
          title={t.listen}
          className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            isPlayingThis
              ? 'bg-emerald-600 text-white animate-pulse'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
          }`}
        >
          {isLoadingThis ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPlayingThis ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {isCurrentSpeaker && (isPlayingThis || isPausedThis) && (
          <button
            onClick={handleStop}
            title={t.stop}
            className="p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700"
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-900 rounded-full px-3 py-1 text-xs font-semibold shadow-xs transition-all ${className}`}
    >
      <button
        onClick={handlePlayToggle}
        className="flex items-center gap-1.5 focus:outline-none"
      >
        {isLoadingThis ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
        ) : isPlayingThis ? (
          <Pause className="w-3.5 h-3.5 fill-current text-emerald-700" />
        ) : isPausedThis ? (
          <Play className="w-3.5 h-3.5 fill-current text-emerald-700" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
        )}
        <span>
          {isLoadingThis
            ? 'લોડિંગ...'
            : isPlayingThis
            ? t.playing
            : isPausedThis
            ? t.paused
            : t.listen}
        </span>
      </button>

      {/* Audio Wave Indicator */}
      {isPlayingThis && (
        <span className="flex items-end gap-0.5 h-3 mx-0.5">
          <span className="w-0.5 bg-emerald-600 h-2 animate-bounce" />
          <span className="w-0.5 bg-emerald-600 h-3 animate-bounce [animation-delay:0.15s]" />
          <span className="w-0.5 bg-emerald-600 h-1.5 animate-bounce [animation-delay:0.3s]" />
        </span>
      )}

      {/* Stop button when active */}
      {isCurrentSpeaker && (isPlayingThis || isPausedThis) && (
        <button
          onClick={handleStop}
          title={t.stop}
          className="ml-1 p-0.5 text-stone-500 hover:text-stone-800 rounded"
        >
          <Square className="w-3 h-3 fill-current text-stone-600" />
        </button>
      )}
    </div>
  );
};
