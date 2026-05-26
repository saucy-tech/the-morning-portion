'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AlignmentSentence, AudioAlignment } from '@/lib/audio';
import { buildBlockSentenceIds } from '@/lib/audio-text';

interface DevotionAudioContextValue {
  activeSentenceId: string | null;
  setActiveSentenceId: (id: string | null) => void;
  sentences: AlignmentSentence[];
  bodySentences: AlignmentSentence[];
  blockSentenceIds: string[][];
  prefersReducedMotion: boolean;
}

const DevotionAudioContext = createContext<DevotionAudioContextValue | null>(null);

type LoadedAudioAlignment = {
  source: string;
  data: AudioAlignment | null;
};

type ActiveSentence = {
  source?: string;
  id: string;
};

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
  const [activeSentence, setActiveSentence] = useState<ActiveSentence | null>(null);
  const [loadedAlignment, setLoadedAlignment] = useState<LoadedAudioAlignment | null>(null);
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
        if (!cancelled) setLoadedAlignment({ source: audioAlignment, data });
      })
      .catch(() => {
        if (!cancelled) setLoadedAlignment({ source: audioAlignment, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [audioAlignment]);

  const setActiveSentenceId = useCallback(
    (id: string | null) => {
      setActiveSentence(id ? { source: audioAlignment, id } : null);
    },
    [audioAlignment],
  );
  const activeSentenceId =
    activeSentence && activeSentence.source === audioAlignment ? activeSentence.id : null;
  const alignment =
    loadedAlignment && loadedAlignment.source === audioAlignment ? loadedAlignment.data : null;
  const sentences = useMemo(() => alignment?.sentences ?? [], [alignment]);
  const bodySentences = useMemo(
    () => sentences.filter((sentence) => sentence.scope !== 'intro'),
    [sentences],
  );
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
      blockSentenceIds,
      prefersReducedMotion,
    }),
    [
      activeSentenceId,
      setActiveSentenceId,
      sentences,
      bodySentences,
      blockSentenceIds,
      prefersReducedMotion,
    ],
  );

  return (
    <DevotionAudioContext.Provider value={value}>{children}</DevotionAudioContext.Provider>
  );
}
