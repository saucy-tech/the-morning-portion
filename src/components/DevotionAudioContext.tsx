'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { AlignmentSentence, AudioAlignment } from '@/lib/audio';

interface DevotionAudioContextValue {
  activeSentenceId: string | null;
  setActiveSentenceId: (id: string | null) => void;
  sentences: AlignmentSentence[];
  bodySentences: AlignmentSentence[];
  claimNextBodySentenceId: () => string | undefined;
  prefersReducedMotion: boolean;
}

const DevotionAudioContext = createContext<DevotionAudioContextValue | null>(null);

export function useDevotionAudio() {
  return useContext(DevotionAudioContext);
}

type DevotionAudioProviderProps = {
  audioAlignment?: string;
  children: React.ReactNode;
};

export function DevotionAudioProvider({ audioAlignment, children }: DevotionAudioProviderProps) {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<AudioAlignment | null>(null);
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const bodySentenceCounter = useRef(0);

  useEffect(() => {
    if (!audioAlignment) return;

    let cancelled = false;
    fetch(audioAlignment)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load alignment');
        return response.json() as Promise<AudioAlignment>;
      })
      .then((data) => {
        if (!cancelled) setAlignment(data);
      })
      .catch(() => {
        if (!cancelled) setAlignment(null);
      });

    return () => {
      cancelled = true;
    };
  }, [audioAlignment]);

  const sentences = useMemo(() => alignment?.sentences ?? [], [alignment]);
  const bodySentences = useMemo(
    () => sentences.filter((sentence) => sentence.scope !== 'intro'),
    [sentences],
  );

  const claimNextBodySentenceId = useCallback(() => {
    const sentence = bodySentences[bodySentenceCounter.current];
    if (!sentence) return undefined;
    bodySentenceCounter.current += 1;
    return sentence.id;
  }, [bodySentences]);

  const value = useMemo(
    () => ({
      activeSentenceId,
      setActiveSentenceId,
      sentences,
      bodySentences,
      claimNextBodySentenceId,
      prefersReducedMotion,
    }),
    [activeSentenceId, sentences, bodySentences, claimNextBodySentenceId, prefersReducedMotion],
  );

  return (
    <DevotionAudioContext.Provider value={value}>{children}</DevotionAudioContext.Provider>
  );
}
