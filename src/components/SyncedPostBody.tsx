'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { useDevotionAudio } from '@/components/DevotionAudioContext';

const SYNC_SELECTOR = 'p, blockquote, li, h1, h2, h3, h4, h5, h6';
const NESTING_SYNC_SELECTOR = 'blockquote, li';

function getSyncElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(SYNC_SELECTOR)).filter((element) => {
    let parent = element.parentElement;

    while (parent && parent !== root) {
      if (parent.matches(NESTING_SYNC_SELECTOR)) {
        return false;
      }
      parent = parent.parentElement;
    }

    return true;
  });
}

export function SyncedPostBody({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctx = useDevotionAudio();
  const activeSentenceId = ctx?.activeSentenceId ?? null;
  const blockSentenceIds = ctx?.blockSentenceIds;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = getSyncElements(root);
    const currentBlockSentenceIds = blockSentenceIds ?? [];

    elements.forEach((element, index) => {
      const sentenceIds = currentBlockSentenceIds[index] ?? [];
      const sentenceIdsValue = sentenceIds.join(' ');
      const isReading = Boolean(activeSentenceId && sentenceIds.includes(activeSentenceId));

      element.classList.toggle('is-reading', isReading);

      if (sentenceIdsValue) {
        element.setAttribute('data-sentence-ids', sentenceIdsValue);
      } else {
        element.removeAttribute('data-sentence-ids');
      }

      if (activeSentenceId && isReading) {
        element.setAttribute('data-sentence-id', activeSentenceId);
      } else if (sentenceIds[0]) {
        element.setAttribute('data-sentence-id', sentenceIds[0]);
      } else {
        element.removeAttribute('data-sentence-id');
      }
    });

    return () => {
      elements.forEach((element) => {
        element.classList.remove('is-reading');
        element.removeAttribute('data-sentence-id');
        element.removeAttribute('data-sentence-ids');
      });
    };
  }, [activeSentenceId, blockSentenceIds]);

  return <div ref={rootRef}>{children}</div>;
}
