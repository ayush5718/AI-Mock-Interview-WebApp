import { useState, useEffect, useCallback } from 'react';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  onStart?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

export const useSpeechSynthesis = ({
  onEnd,
  onStart,
  onError,
}: UseSpeechSynthesisProps = {}): UseSpeechSynthesisReturn => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const updateVoices = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    // Set default voice (prefer English voices)
    if (availableVoices.length > 0 && !voice) {
      const englishVoice = availableVoices.find(v => 
        v.lang.startsWith('en') && v.name.includes('Google')
      ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
      setVoice(englishVoice);
    }
  }, [voice]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      updateVoices();
      
      // Some browsers load voices asynchronously
      window.speechSynthesis.onvoiceschanged = updateVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [updateVoices]);

  const speak = useCallback((text: string) => {
    if (!supported || !text.trim()) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event handlers
    utterance.onstart = () => {
      setSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      setSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (error) => {
      setSpeaking(false);
      onError?.(error);
      console.error('Speech synthesis error:', error);
    };

    utterance.onpause = () => setSpeaking(false);
    utterance.onresume = () => setSpeaking(true);

    // Speak the text
    window.speechSynthesis.speak(utterance);
  }, [supported, voice, rate, pitch, volume, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported && speaking) {
      window.speechSynthesis.pause();
    }
  }, [supported, speaking]);

  const resume = useCallback(() => {
    if (supported && !speaking) {
      window.speechSynthesis.resume();
    }
  }, [supported, speaking]);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    supported,
    voices,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  };
};
