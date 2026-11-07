import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoicePlayerProps {
  textToRead: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ textToRead }) => {
  const { language, t } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(0.85); // Default to slightly slower for older adults
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  // Cleanup speech when unmounting or text changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToRead]);

  const selectVoiceForLanguage = (lang: string, synth: SpeechSynthesis) => {
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'Hindi') {
      return (
        voices.find((v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')) ||
        voices.find((v) => v.lang.includes('IN')) ||
        voices[0]
      );
    } else if (lang === 'Marathi') {
      return (
        voices.find((v) => v.lang.startsWith('mr') || v.name.toLowerCase().includes('marathi')) ||
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.includes('IN')) ||
        voices[0]
      );
    } else {
      return (
        voices.find((v) => v.lang === 'en-IN' || v.name.includes('India')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0]
      );
    }
  };

  const handlePlay = () => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const matchedVoice = selectVoiceForLanguage(language, synth);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      setIsPaused(false);
      setIsPlaying(false);
      // Restart with new rate
      setTimeout(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = newRate;
        const matchedVoice = selectVoiceForLanguage(language, synth);
        if (matchedVoice) utterance.voice = matchedVoice;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utteranceRef.current = utterance;
        synth.speak(utterance);
      }, 50);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            isPlaying ? 'bg-blue-600 text-white animate-pulse' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>{t.btnListen}</span>
            {isPlaying && (
              <span className="inline-flex items-center gap-0.5 text-xs text-blue-700 font-mono">
                <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {language === 'Hindi'
              ? 'आवाज़ में धीमी गति से सुनें'
              : language === 'Marathi'
              ? 'सावकाश आवाजात ऐका'
              : 'Listen calmly at your own pace'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Play / Pause / Resume Button */}
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPaused ? t.btnResume : t.btnListen}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>{t.btnPause}</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600"
            title={t.btnStop}
            aria-label={t.btnStop}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Speed Controls: 0.75x | 1x | 1.25x */}
        <div
          className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 ml-1"
          role="group"
          aria-label="Playback speed"
        >
          {[
            { val: 0.75, label: '0.75x' },
            { val: 0.9, label: '1x' },
            { val: 1.15, label: '1.25x' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleSpeedChange(item.val)}
              className={`px-2 py-1 text-xs font-semibold rounded-md min-h-[36px] transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 ${
                Math.abs(rate - item.val) < 0.1
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
