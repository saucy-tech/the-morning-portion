import fs from 'fs';
import path from 'path';

import { splitIntoSentences } from '@/lib/audio-text';

export interface AlignmentSentence {
  id: string;
  text: string;
  start: number;
  end: number;
  scope?: 'intro' | 'body';
}

export interface AudioAlignment {
  version: number;
  sentences: AlignmentSentence[];
}

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

export function getDefaultAudioUrl(slug: string): string | undefined {
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  if (fs.existsSync(audioPath)) {
    return `/audio/${slug}.mp3`;
  }
  return undefined;
}

export function getDefaultAlignmentUrl(slug: string): string | undefined {
  const alignmentPath = path.join(AUDIO_DIR, `${slug}.alignment.json`);
  if (fs.existsSync(alignmentPath)) {
    return `/audio/${slug}.alignment.json`;
  }
  return undefined;
}

export function resolvePostAudio(
  slug: string,
  frontmatterAudio?: string,
  frontmatterAlignment?: string,
): { audio?: string; audioAlignment?: string } {
  const audio = frontmatterAudio ?? getDefaultAudioUrl(slug);
  const audioAlignment = frontmatterAlignment ?? getDefaultAlignmentUrl(slug);
  return { audio, audioAlignment };
}

/** Strip MDX/markdown to plain text suitable for TTS or alignment. */
export function mdxToPlainText(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildTtsScript(title: string, excerpt: string, content: string): string {
  const body = mdxToPlainText(content);
  return `${title}. ${excerpt} ${body}`.replace(/\s+/g, ' ').trim();
}

export interface CharacterAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export function aggregateCharacterAlignmentToSentences(
  alignment: CharacterAlignment,
  introText?: string,
): AlignmentSentence[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  if (characters.length === 0) return [];

  const fullText = characters.join('');
  const sentences = splitIntoSentences(fullText);
  if (sentences.length === 0) return [];

  const introSentenceCount = introText ? splitIntoSentences(introText.replace(/\s+/g, ' ').trim()).length : 0;

  const result: AlignmentSentence[] = [];
  let charIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const startIndex = charIndex;
    const endIndex = startIndex + sentence.length;

    const start =
      character_start_times_seconds[startIndex] ??
      character_start_times_seconds[character_start_times_seconds.length - 1] ??
      0;
    const end =
      character_end_times_seconds[Math.min(endIndex - 1, character_end_times_seconds.length - 1)] ??
      start;

    result.push({
      id: `s${i}`,
      text: sentence,
      start,
      end,
      scope: i < introSentenceCount ? 'intro' : 'body',
    });

    charIndex = endIndex;
    while (charIndex < characters.length && /\s/.test(characters[charIndex])) {
      charIndex++;
    }
  }

  return result;
}

export function mergeAlignmentChunks(
  chunks: Array<{ alignment: CharacterAlignment | null }>,
): CharacterAlignment {
  const merged: CharacterAlignment = {
    characters: [],
    character_start_times_seconds: [],
    character_end_times_seconds: [],
  };

  for (const chunk of chunks) {
    if (!chunk.alignment) continue;
    merged.characters.push(...chunk.alignment.characters);
    merged.character_start_times_seconds.push(...chunk.alignment.character_start_times_seconds);
    merged.character_end_times_seconds.push(...chunk.alignment.character_end_times_seconds);
  }

  return merged;
}

export { splitIntoSentences } from '@/lib/audio-text';
