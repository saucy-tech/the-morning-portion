'use client';

import { DevotionAudioProvider } from '@/components/DevotionAudioContext';
import DevotionPlayer from '@/components/DevotionPlayer';
import { SyncedBlockIndexReset } from '@/components/SyncedPostBody';

type DevotionReadingShellProps = {
  audio: string;
  audioAlignment?: string;
  content: string;
  title: string;
  autoPlay?: boolean;
  children: React.ReactNode;
};

export default function DevotionReadingShell({
  audio,
  audioAlignment,
  content,
  title,
  autoPlay,
  children,
}: DevotionReadingShellProps) {
  return (
    <DevotionAudioProvider audioAlignment={audioAlignment} content={content}>
      <DevotionPlayer audio={audio} title={title} autoPlay={autoPlay} />
      <SyncedBlockIndexReset>{children}</SyncedBlockIndexReset>
    </DevotionAudioProvider>
  );
}
