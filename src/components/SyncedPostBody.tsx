'use client';

import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { useDevotionAudio } from '@/components/DevotionAudioContext';
import { splitIntoSentences } from '@/lib/audio-text';

function extractTextFromChildren(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return String(child);
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractTextFromChildren(child.props.children);
      }
      return '';
    })
    .join('');
}

function useSyncedSentenceContent(children: ReactNode): ReactNode {
  const ctx = useDevotionAudio();
  const plainText = extractTextFromChildren(children).replace(/\s+/g, ' ').trim();
  const sentences = splitIntoSentences(plainText);

  if (!ctx || ctx.bodySentences.length === 0 || sentences.length === 0) {
    return children;
  }

  return sentences.map((sentence, index) => {
    const sentenceId = ctx.claimNextBodySentenceId();
    if (!sentenceId) {
      return (
        <span key={`fallback-${index}`} className="sync-sentence">
          {sentence}
          {index < sentences.length - 1 ? ' ' : ''}
        </span>
      );
    }

    const isReading = ctx.activeSentenceId === sentenceId;

    return (
      <span
        key={sentenceId}
        data-sentence-id={sentenceId}
        className={isReading ? 'sync-sentence is-reading' : 'sync-sentence'}
      >
        {sentence}
        {index < sentences.length - 1 ? ' ' : ''}
      </span>
    );
  });
}

export function SyncedParagraph(props: ComponentPropsWithoutRef<'p'>) {
  const content = useSyncedSentenceContent(props.children);
  return <p {...props}>{content}</p>;
}

export function SyncedBlockquote(props: ComponentPropsWithoutRef<'blockquote'>) {
  const content = useSyncedSentenceContent(props.children);
  return <blockquote {...props}>{content}</blockquote>;
}

export function SyncedListItem(props: ComponentPropsWithoutRef<'li'>) {
  const content = useSyncedSentenceContent(props.children);
  return <li {...props}>{content}</li>;
}

export const syncedMdxComponents = {
  p: SyncedParagraph,
  blockquote: SyncedBlockquote,
  li: SyncedListItem,
};
