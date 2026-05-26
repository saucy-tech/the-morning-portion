'use client';

import { DevotionAudioProvider } from '@/components/DevotionAudioContext';
import DevotionPlayer from '@/components/DevotionPlayer';
import { SyncedPostBody } from '@/components/SyncedPostBody';

type DevotionReadingShellProps = {
  audio: string;
  audioAlignment?: string;
  content: string;
  title: string;
  children: React.ReactNode;
};

export default function DevotionReadingShell({
  audio,
  audioAlignment,
  content,
  title,
  children,
}: DevotionReadingShellProps) {
  return (
    <DevotionAudioProvider audioAlignment={audioAlignment} content={content}>
      <DevotionPlayer audio={audio} title={title} />
      <SyncedPostBody>{children}</SyncedPostBody>
    </DevotionAudioProvider>
  );
}
