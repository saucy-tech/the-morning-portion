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
  registerBlock: () => number;
  prefersReducedMotion: boolean;
  alignmentLoaded: boolean;
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
  const blockCounter = useRef(0);

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

  const registerBlock = useCallback(() => {
    const index = blockCounter.current;
    blockCounter.current += 1;
    return index;
  }, []);

  const value = useMemo(
    () => ({
      activeSentenceId,
      setActiveSentenceId,
      sentences,
      bodySentences,
      registerBlock,
      prefersReducedMotion,
      alignmentLoaded: Boolean(audioAlignment ? alignment : true),
    }),
    [
      activeSentenceId,
      sentences,
      bodySentences,
      registerBlock,
      prefersReducedMotion,
      audioAlignment,
      alignment,
    ],
  );

  return (
    <DevotionAudioContext.Provider value={value}>{children}</DevotionAudioContext.Provider>
  );
}

export function useSyncedBlockProps(): {
  sentenceId?: string;
  className?: string;
  'data-sentence-id'?: string;
} {
  const ctx = useDevotionAudio();
  const [blockIndex] = useState(() => ctx?.registerBlock() ?? -1);

  if (!ctx || ctx.bodySentences.length === 0 || blockIndex < 0) {
    return {};
  }

  const sentence = ctx.bodySentences[blockIndex];
  if (!sentence) {
    return {};
  }

  const isReading = ctx.activeSentenceId === sentence.id;

  return {
    sentenceId: sentence.id,
    'data-sentence-id': sentence.id,
    className: isReading ? 'is-reading' : undefined,
  };
}
