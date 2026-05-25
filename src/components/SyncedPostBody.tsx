'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { useSyncedBlockProps } from '@/components/DevotionAudioContext';

function mergeClassName(base?: string, extra?: string) {
  return [base, extra].filter(Boolean).join(' ') || undefined;
}

export function SyncedParagraph(props: ComponentPropsWithoutRef<'p'>) {
  const syncProps = useSyncedBlockProps();

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
  const syncProps = useSyncedBlockProps();

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
  const syncProps = useSyncedBlockProps();

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
