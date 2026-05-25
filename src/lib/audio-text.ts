const SENTENCE_END = /[.!?]+(?:\s|$)/;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

const ORDERED_LIST_MARKER = /^\d+[.)]\s/;
const UNORDERED_LIST_MARKER = /^[-*+]\s/;
const LIST_MARKER = /^(?:\d+[.)]|[-*+])\s/;

function isListLine(line: string): boolean {
  return LIST_MARKER.test(line);
}

export function normalizeBlockText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentences: string[] = [];
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

/** Extract syncable MDX blocks (blockquote, paragraph, list item) in render order. */
export function extractSyncBlockTexts(content: string): string[] {
  const blocks: string[] = [];
  const lines = content.split('\n');
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index++;
      continue;
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      index++;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(stripInlineMarkdown(lines[index].replace(/^>\s?/, '').trim()));
        index++;
      }
      blocks.push(normalizeBlockText(quoteLines.join(' ')));
      continue;
    }

    if (UNORDERED_LIST_MARKER.test(trimmed)) {
      blocks.push(normalizeBlockText(stripInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ''))));
      index++;
      continue;
    }

    if (ORDERED_LIST_MARKER.test(trimmed)) {
      blocks.push(normalizeBlockText(stripInlineMarkdown(trimmed.replace(/^\d+[.)]\s+/, ''))));
      index++;
      continue;
    }

    if (trimmed.startsWith('```')) {
      index++;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        index++;
      }
      index++;
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line) break;
      if (/^#{1,6}\s/.test(line) || /^>\s?/.test(line) || isListLine(line)) break;
      if (line.startsWith('```')) break;
      paragraphLines.push(stripInlineMarkdown(line));
      index++;
    }

    if (paragraphLines.length > 0) {
      blocks.push(normalizeBlockText(paragraphLines.join(' ')));
    }
  }

  return blocks.filter(Boolean);
}

export function buildBlockSentenceIds(
  content: string,
  bodySentences: Array<{ id: string }>,
): string[][] {
  const blocks = extractSyncBlockTexts(content);
  let bodyIndex = 0;

  return blocks.map((blockText) => {
    const sentenceCount = splitIntoSentences(blockText).length;
    const ids = bodySentences.slice(bodyIndex, bodyIndex + sentenceCount).map((sentence) => sentence.id);
    bodyIndex += sentenceCount;
    return ids;
  });
}
