'use client';

import { DevotionAudioProvider } from '@/components/DevotionAudioContext';
import DevotionPlayer from '@/components/DevotionPlayer';

type DevotionReadingShellProps = {
  audio: string;
  audioAlignment?: string;
  title: string;
  autoPlay?: boolean;
  children: React.ReactNode;
};

export default function DevotionReadingShell({
  audio,
  audioAlignment,
  title,
  autoPlay,
  children,
}: DevotionReadingShellProps) {
  return (
    <DevotionAudioProvider audioAlignment={audioAlignment}>
      <DevotionPlayer audio={audio} title={title} autoPlay={autoPlay} />
      {children}
    </DevotionAudioProvider>
  );
}
