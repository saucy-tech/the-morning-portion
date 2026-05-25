'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDevotionAudio } from '@/components/DevotionAudioContext';

type DevotionPlayerProps = {
  audio: string;
  title: string;
  autoPlay?: boolean;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const PLAYBACK_RATES = [1, 1.25] as const;

export default function DevotionPlayer({ audio, title, autoPlay = false }: DevotionPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastScrolledId = useRef<string | null>(null);
  const ctx = useDevotionAudio();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<(typeof PLAYBACK_RATES)[number]>(1);
  const [needsGesture, setNeedsGesture] = useState(false);

  const sentences = useMemo(() => ctx?.sentences ?? [], [ctx?.sentences]);

  const updateActiveSentence = useCallback(
    (time: number) => {
      if (!ctx || sentences.length === 0) return;

      const active = sentences.find((sentence) => time >= sentence.start && time < sentence.end);
      const activeId = active?.id ?? null;
      ctx.setActiveSentenceId(activeId);

      if (
        activeId &&
        active?.scope === 'body' &&
        activeId !== lastScrolledId.current &&
        !ctx.prefersReducedMotion
      ) {
        lastScrolledId.current = activeId;
        const element = document.querySelector(`[data-sentence-id="${activeId}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [ctx, sentences],
  );

  const handleTimeUpdate = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime);
    updateActiveSentence(el.currentTime);
  }, [updateActiveSentence]);

  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
        setNeedsGesture(false);
      } catch {
        setNeedsGesture(true);
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback(
    (value: number) => {
      const el = audioRef.current;
      if (!el) return;
      el.currentTime = value;
      setCurrentTime(value);
      updateActiveSentence(value);
    },
    [updateActiveSentence],
  );

  const cyclePlaybackRate = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    el.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }, [playbackRate]);

  useEffect(() => {
    if (!autoPlay) return;

    const el = audioRef.current;
    if (!el) return;

    el.play()
      .then(() => {
        setIsPlaying(true);
        setNeedsGesture(false);
      })
      .catch(() => {
        setNeedsGesture(true);
      });
  }, [autoPlay, audio]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="devotion-player" aria-label={`Audio player for ${title}`}>
      <audio
        ref={audioRef}
        src={audio}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          ctx?.setActiveSentenceId(null);
          lastScrolledId.current = null;
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="devotion-player__controls">
        <button
          type="button"
          className="devotion-player__play button ghost"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause devotion audio' : 'Play devotion audio'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="devotion-player__track">
          <input
            type="range"
            className="devotion-player__progress"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="Seek audio"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
          <div className="devotion-player__time" aria-hidden="true">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          type="button"
          className="devotion-player__rate"
          onClick={cyclePlaybackRate}
          aria-label={`Playback speed ${playbackRate}x`}
        >
          {playbackRate}x
        </button>
      </div>

      {needsGesture && (
        <p className="devotion-player__gesture">
          <button type="button" className="devotion-player__gesture-btn" onClick={togglePlay}>
            Tap to start listening
          </button>
        </p>
      )}
    </div>
  );
}
