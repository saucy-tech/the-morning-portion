'use client';

import {
  Children,
  isValidElement,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { useDevotionAudio } from '@/components/DevotionAudioContext';
import { normalizeBlockText } from '@/lib/audio-text';

function mergeClassName(base?: string, extra?: string) {
  return [base, extra].filter(Boolean).join(' ') || undefined;
}

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

export function SyncedBlockIndexReset({ children }: { children: ReactNode }) {
  const ctx = useDevotionAudio();
  ctx?.resetBlockRegistration();
  return children;
}

function useSyncedBlockProps(children: ReactNode) {
  const ctx = useDevotionAudio();
  const plainText = useMemo(
    () => normalizeBlockText(extractTextFromChildren(children)),
    [children],
  );
  const blockIndex =
    ctx && plainText.length > 0 ? ctx.registerBlockIndex(plainText) : -1;

  const sentenceIds = blockIndex >= 0 ? (ctx?.blockSentenceIds[blockIndex] ?? []) : [];
  const activeId = sentenceIds.find((id) => id === ctx?.activeSentenceId);
  const isReading = Boolean(activeId);

  return {
    className: isReading ? 'is-reading' : undefined,
    'data-sentence-id': activeId ?? sentenceIds[0],
  };
}

export function SyncedParagraph(props: ComponentPropsWithoutRef<'p'>) {
  const syncProps = useSyncedBlockProps(props.children);

  return (
    <p
      {...props}
      className={mergeClassName(props.className, syncProps.className)}
      data-sentence-id={syncProps['data-sentence-id']}
    >
      {props.children}
    </p>
  );
}

export function SyncedBlockquote(props: ComponentPropsWithoutRef<'blockquote'>) {
  const syncProps = useSyncedBlockProps(props.children);

  return (
    <blockquote
      {...props}
      className={mergeClassName(props.className, syncProps.className)}
      data-sentence-id={syncProps['data-sentence-id']}
    >
      {props.children}
    </blockquote>
  );
}

export function SyncedListItem(props: ComponentPropsWithoutRef<'li'>) {
  const syncProps = useSyncedBlockProps(props.children);

  return (
    <li
      {...props}
      className={mergeClassName(props.className, syncProps.className)}
      data-sentence-id={syncProps['data-sentence-id']}
    >
      {props.children}
    </li>
  );
}

export const syncedMdxComponents = {
  p: SyncedParagraph,
  blockquote: SyncedBlockquote,
  li: SyncedListItem,
};
