'use client';

import {
  Children,
  isValidElement,
  useMemo,
  type ComponentPropsWithoutRef,
  type ElementType,
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

function createSyncedBlockComponent<T extends ElementType>(Tag: T) {
  return function SyncedBlockComponent(props: ComponentPropsWithoutRef<T>) {
    const syncProps = useSyncedBlockProps(
      (props as ComponentPropsWithoutRef<ElementType>).children as ReactNode,
    );
    const Component = Tag as ElementType;

    return (
      <Component
        {...props}
        className={mergeClassName(
          (props as { className?: string }).className,
          syncProps.className,
        )}
        data-sentence-id={syncProps['data-sentence-id']}
      />
    );
  };
}

export const SyncedParagraph = createSyncedBlockComponent('p');
export const SyncedBlockquote = createSyncedBlockComponent('blockquote');
export const SyncedListItem = createSyncedBlockComponent('li');
export const SyncedHeading1 = createSyncedBlockComponent('h1');
export const SyncedHeading2 = createSyncedBlockComponent('h2');
export const SyncedHeading3 = createSyncedBlockComponent('h3');
export const SyncedHeading4 = createSyncedBlockComponent('h4');
export const SyncedHeading5 = createSyncedBlockComponent('h5');
export const SyncedHeading6 = createSyncedBlockComponent('h6');

export const syncedMdxComponents = {
  p: SyncedParagraph,
  blockquote: SyncedBlockquote,
  li: SyncedListItem,
  h1: SyncedHeading1,
  h2: SyncedHeading2,
  h3: SyncedHeading3,
  h4: SyncedHeading4,
  h5: SyncedHeading5,
  h6: SyncedHeading6,
};
