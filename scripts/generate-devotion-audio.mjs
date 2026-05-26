#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import matter from 'gray-matter';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'public', 'audio');

function loadEnvFiles() {
  const merged = {};

  for (const filename of ['.env', '.env.local']) {
    const envPath = path.join(ROOT, filename);
    if (!fs.existsSync(envPath)) continue;

    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      merged[key] = value;
    }
  }

  for (const [key, value] of Object.entries(merged)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFiles();

matter.engines.yaml = {
  parse: (str) => yaml.load(str),
  stringify: (obj) => yaml.dump(obj),
};

const SENTENCE_END = /[.!?]+(?:\s|$)/;

function parseArgs(argv) {
  const positional = [];
  const flags = new Set();
  let outputDir = DEFAULT_OUTPUT_DIR;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--output-dir') {
      outputDir = argv[i + 1] ?? DEFAULT_OUTPUT_DIR;
      i++;
      continue;
    }

    if (arg.startsWith('--')) {
      flags.add(arg);
      continue;
    }

    positional.push(arg);
  }

  return {
    slug: positional[0],
    alignOnly: flags.has('--align-only'),
    dryRun: flags.has('--dry-run'),
    outputDir,
  };
}

function mdxToPlainText(content) {
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

function splitIntoSentences(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentences = [];
  let buffer = '';

  for (const char of normalized) {
    buffer += char;
    if (SENTENCE_END.test(buffer)) {
      const trimmed = buffer.trim();
      if (trimmed) sentences.push(trimmed);
      buffer = '';
    }
  }

  const remainder = buffer.trim();
  if (remainder) sentences.push(remainder);

  return sentences;
}

function buildTtsScript(title, excerpt, content) {
  const body = mdxToPlainText(content);
  return `${title}. ${excerpt} ${body}`.replace(/\s+/g, ' ').trim();
}

function buildIntroText(title, excerpt) {
  return `${title}. ${excerpt}`.replace(/\s+/g, ' ').trim();
}

function mergeAlignmentChunks(chunks) {
  const merged = {
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

function aggregateCharacterAlignmentToSentences(alignment, introText) {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  if (characters.length === 0) return [];

  const fullText = characters.join('');
  const sentences = splitIntoSentences(fullText);
  if (sentences.length === 0) return [];

  const introSentenceCount = introText ? splitIntoSentences(introText).length : 0;
  const result = [];
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

function forcedAlignmentToCharacterAlignment(forced) {
  return {
    characters: forced.characters.map((item) => item.text),
    character_start_times_seconds: forced.characters.map((item) => item.start),
    character_end_times_seconds: forced.characters.map((item) => item.end),
  };
}

function readPost(slug) {
  const postPath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(postPath)) {
    throw new Error(`Post not found: ${postPath}`);
  }

  const raw = fs.readFileSync(postPath, 'utf-8');
  const { data, content } = matter(raw);
  return { postPath, raw, data, content };
}

function patchFrontmatter(postPath, raw, data, audioUrl, alignmentUrl) {
  const parsed = matter(raw);
  parsed.data = {
    ...parsed.data,
    audio: audioUrl,
    audioAlignment: alignmentUrl,
  };
  fs.writeFileSync(postPath, matter.stringify(parsed.content, parsed.data), 'utf-8');
}

async function parseTimestampStream(response) {
  const text = await response.text();
  const chunks = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) continue;

    const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
    if (!payload || payload === '[DONE]') continue;

    try {
      chunks.push(JSON.parse(payload));
    } catch {
      // Some streams return raw JSON objects separated by blank lines.
    }
  }

  if (chunks.length === 0) {
    try {
      chunks.push(JSON.parse(text));
    } catch {
      throw new Error('Unable to parse ElevenLabs timestamp stream response.');
    }
  }

  return chunks;
}

async function generateSpeechWithTimestamps({ apiKey, voiceId, text }) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errorText}`);
  }

  return parseTimestampStream(response);
}

async function forcedAlign({ apiKey, audioPath, text }) {
  const audioBuffer = fs.readFileSync(audioPath);
  if (audioBuffer.length === 0) {
    throw new Error(
      `Audio file is empty: ${audioPath}. Re-export the MP3 from ElevenLabs and try again.`,
    );
  }

  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  formData.append('file', blob, path.basename(audioPath));
  formData.append('text', text);

  const response = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs forced alignment failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

function publicUrlForOutput(outputDir, filename) {
  const publicRoot = path.resolve(path.join(ROOT, 'public'));
  const filePath = path.resolve(outputDir, filename);

  if (!filePath.startsWith(`${publicRoot}${path.sep}`) && filePath !== publicRoot) {
    return undefined;
  }

  const relative = path.relative(publicRoot, filePath);
  return `/${relative.split(path.sep).join('/')}`;
}

function writeOutputs({ outputDir, slug, audioBuffers, alignment, dryRun }) {
  const mp3Path = path.join(outputDir, `${slug}.mp3`);
  const alignmentPath = path.join(outputDir, `${slug}.alignment.json`);
  const audioUrl = publicUrlForOutput(outputDir, `${slug}.mp3`);
  const alignmentUrl = publicUrlForOutput(outputDir, `${slug}.alignment.json`);
  const canPatchFrontmatter = Boolean(audioUrl && alignmentUrl);

  if (dryRun) {
    console.log(`[dry-run] Would write ${mp3Path}`);
    console.log(`[dry-run] Would write ${alignmentPath}`);
    if (!canPatchFrontmatter) {
      console.log('[dry-run] Output dir is outside public/; frontmatter would not be patched.');
    }
    return { audioUrl, alignmentUrl, canPatchFrontmatter };
  }

  fs.mkdirSync(outputDir, { recursive: true });

  if (audioBuffers.length > 0) {
    fs.writeFileSync(mp3Path, Buffer.concat(audioBuffers));
  }
  fs.writeFileSync(
    alignmentPath,
    JSON.stringify({ version: 1, sentences: alignment }, null, 2),
    'utf-8',
  );

  return { audioUrl, alignmentUrl, canPatchFrontmatter };
}

async function main() {
  const { slug, alignOnly, dryRun, outputDir } = parseArgs(process.argv.slice(2));

  if (!slug) {
    console.error('Usage: pnpm generate-audio <slug> [--align-only] [--dry-run] [--output-dir path]');
    process.exit(1);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey && !dryRun) {
    console.error(
      'Missing ELEVENLABS_API_KEY. Set it in .env.local or export it in your shell.',
    );
    process.exit(1);
  }

  const { postPath, raw, data, content } = readPost(slug);
  const title = data.title;
  const excerpt = data.excerpt;
  const ttsScript = buildTtsScript(title, excerpt, content);
  const introText = buildIntroText(title, excerpt);
  const mp3Path = path.join(outputDir, `${slug}.mp3`);

  if (alignOnly) {
    if (!fs.existsSync(mp3Path)) {
      console.error(`Audio file not found for align-only mode: ${mp3Path}`);
      process.exit(1);
    }

    const mp3Size = fs.statSync(mp3Path).size;
    if (mp3Size === 0) {
      console.error(
        `Audio file is empty (0 bytes): ${mp3Path}\n` +
          'The previous align-only run may have overwritten it. Re-export the MP3 from ElevenLabs.',
      );
      process.exit(1);
    }

    if (dryRun) {
      console.log(
        `[dry-run] Would align existing audio for "${slug}" (${Math.round(mp3Size / 1024)} KB)`,
      );
      console.log(`[dry-run] Would call ElevenLabs forced alignment (${ttsScript.length} chars)`);
      const { audioUrl, alignmentUrl, canPatchFrontmatter } = writeOutputs({
        outputDir,
        slug,
        audioBuffers: [],
        alignment: [],
        dryRun,
      });

      if (canPatchFrontmatter && audioUrl && alignmentUrl) {
        console.log(`[dry-run] Would patch frontmatter with audio: ${audioUrl}`);
      }

      return;
    }

    console.log(`Aligning existing audio for "${slug}" (${Math.round(mp3Size / 1024)} KB)...`);
    const forced = await forcedAlign({ apiKey, audioPath: mp3Path, text: ttsScript });
    const characterAlignment = forcedAlignmentToCharacterAlignment(forced);
    const sentences = aggregateCharacterAlignmentToSentences(characterAlignment, introText);
    const { audioUrl, alignmentUrl, canPatchFrontmatter } = writeOutputs({
      outputDir,
      slug,
      audioBuffers: [],
      alignment: sentences,
      dryRun,
    });

    if (!dryRun && canPatchFrontmatter && audioUrl && alignmentUrl) {
      patchFrontmatter(postPath, raw, data, audioUrl, alignmentUrl);
    } else if (!dryRun && !canPatchFrontmatter) {
      console.log('Skipped frontmatter patch: output dir is outside public/.');
    }

    console.log(`Alignment ready for ${slug}`);
    console.log(`  audio: ${audioUrl}`);
    console.log(`  alignment: ${alignmentUrl}`);
    return;
  }

  if (!voiceId && !dryRun) {
    console.error(
      'Missing ELEVENLABS_VOICE_ID. Set it in .env.local or export it in your shell.',
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would generate audio for "${slug}" (${ttsScript.length} chars)`);
    console.log('[dry-run] Would call ElevenLabs TTS with timestamps');
    const { audioUrl, alignmentUrl, canPatchFrontmatter } = writeOutputs({
      outputDir,
      slug,
      audioBuffers: [],
      alignment: [],
      dryRun,
    });

    if (canPatchFrontmatter && audioUrl && alignmentUrl) {
      console.log(`[dry-run] Would patch frontmatter with audio: ${audioUrl}`);
    }

    return;
  }

  console.log(`Generating audio for "${slug}" (${ttsScript.length} chars)...`);
  const chunks = await generateSpeechWithTimestamps({ apiKey, voiceId, text: ttsScript });
  const merged = mergeAlignmentChunks(chunks);
  const sentences = aggregateCharacterAlignmentToSentences(merged, introText);
  const audioBuffers = chunks
    .map((chunk) => chunk.audio_base64)
    .filter(Boolean)
    .map((encoded) => Buffer.from(encoded, 'base64'));

  if (audioBuffers.length === 0) {
    throw new Error('ElevenLabs returned no audio data.');
  }

  const { audioUrl, alignmentUrl, canPatchFrontmatter } = writeOutputs({
    outputDir,
    slug,
    audioBuffers,
    alignment: sentences,
    dryRun,
  });

  if (!dryRun && canPatchFrontmatter && audioUrl && alignmentUrl) {
    patchFrontmatter(postPath, raw, data, audioUrl, alignmentUrl);
  } else if (!dryRun && !canPatchFrontmatter) {
    console.log('Skipped frontmatter patch: output dir is outside public/.');
  }

  console.log(`Audio ready for ${slug}`);
  console.log(`  audio: ${audioUrl}`);
  console.log(`  alignment: ${alignmentUrl}`);
  console.log(`  sentences: ${sentences.length} (${sentences.filter((s) => s.scope === 'body').length} body)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
