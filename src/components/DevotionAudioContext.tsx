'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AlignmentSentence, AudioAlignment } from '@/lib/audio';
import { buildBlockSentenceIds, extractSyncBlockTexts } from '@/lib/audio-text';

interface DevotionAudioContextValue {
  activeSentenceId: string | null;
  setActiveSentenceId: (id: string | null) => void;
  sentences: AlignmentSentence[];
  bodySentences: AlignmentSentence[];
  blockTexts: string[];
  blockSentenceIds: string[][];
  prefersReducedMotion: boolean;
}

const DevotionAudioContext = createContext<DevotionAudioContextValue | null>(null);

export function useDevotionAudio() {
  return useContext(DevotionAudioContext);
}

type DevotionAudioProviderProps = {
  audioAlignment?: string;
  content: string;
  children: React.ReactNode;
};

export function DevotionAudioProvider({
  audioAlignment,
  content,
  children,
}: DevotionAudioProviderProps) {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<AudioAlignment | null>(null);
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

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
  const blockTexts = useMemo(() => extractSyncBlockTexts(content), [content]);
  const blockSentenceIds = useMemo(
    () => buildBlockSentenceIds(content, bodySentences),
    [content, bodySentences],
  );

  const value = useMemo(
    () => ({
      activeSentenceId,
      setActiveSentenceId,
      sentences,
      bodySentences,
      blockTexts,
      blockSentenceIds,
      prefersReducedMotion,
    }),
    [
      activeSentenceId,
      sentences,
      bodySentences,
      blockTexts,
      blockSentenceIds,
      prefersReducedMotion,
    ],
  );

  return (
    <DevotionAudioContext.Provider value={value}>{children}</DevotionAudioContext.Provider>
  );
}
