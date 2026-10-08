type TTSState = 'idle' | 'loading' | 'playing' | 'paused';
type StateListener = (state: TTSState) => void;

class TTSService {
  private state: TTSState = 'idle';
  private listeners: Set<StateListener> = new Set();
  private audioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private setState(newState: TTSState) {
    this.state = newState;
    this.listeners.forEach((cb) => cb(this.state));
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): TTSState {
    return this.state;
  }

  public stop() {
    // Stop Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;

    // Stop Audio Element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }

    this.setState('idle');
  }

  public pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.setState('paused');
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.setState('paused');
      }
    }
  }

  public resume() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch(console.error);
      this.setState('playing');
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.setState('playing');
      }
    }
  }

  public async speak(text: string, language: 'gu' | 'en' | 'hi' = 'gu') {
    this.stop();

    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    // Check if browser has a native voice matching the language
    const hasNativeVoice = this.checkBrowserVoice(language);

    if (hasNativeVoice) {
      this.speakWithWebSpeech(cleanText, language);
    } else {
      // Fallback to Server Gemini TTS (gemini-3.8-flash-lite-tts)
      await this.speakWithGeminiTTS(cleanText, language);
    }
  }

  private checkBrowserVoice(language: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    const voices = window.speechSynthesis.getVoices();
    const langCode = language === 'gu' ? 'gu' : language === 'hi' ? 'hi' : 'en';
    return voices.some((v) => v.lang.toLowerCase().startsWith(langCode));
  }

  private speakWithWebSpeech(text: string, language: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const langCode = language === 'gu' ? 'gu' : language === 'hi' ? 'hi' : 'en';

    const matchVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langCode)
    );
    if (matchVoice) {
      utterance.voice = matchVoice;
    }
    utterance.lang = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // slightly relaxed for comfortable listening
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.setState('playing');
    };

    utterance.onend = () => {
      this.setState('idle');
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('Web Speech error, attempting Gemini TTS fallback:', e);
      this.speakWithGeminiTTS(text, language);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private async speakWithGeminiTTS(text: string, language: string) {
    this.setState('loading');
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error('TTS server responded with error');
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned');
      }

      const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioSrc);
      this.audioElement = audio;

      audio.onplay = () => {
        this.setState('playing');
      };

      audio.onended = () => {
        this.setState('idle');
        this.audioElement = null;
      };

      audio.onerror = () => {
        this.setState('idle');
        this.audioElement = null;
      };

      await audio.play();
    } catch (err) {
      console.warn('TTS playback error:', err);
      // As a graceful fallback, if browser WebSpeech exists without language-specific voice, try speaking anyway
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.rate = 0.9;
          fallbackUtterance.onstart = () => this.setState('playing');
          fallbackUtterance.onend = () => this.setState('idle');
          window.speechSynthesis.speak(fallbackUtterance);
          return;
        } catch (e) {
          // ignore
        }
      }
      this.setState('idle');
    }
  }
}

export const tts = new TTSService();
