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

function tokenizeForSync(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function rangesOverlap(
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
): boolean {
  return leftStart < rightEnd && rightStart < leftEnd;
}

/** Extract syncable MDX blocks (heading, blockquote, paragraph, list item) in render order. */
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
      blocks.push(normalizeBlockText(stripInlineMarkdown(trimmed.replace(/^#{1,6}\s+/, ''))));
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
  bodySentences: Array<{ id: string; text: string }>,
): string[][] {
  const blocks = extractSyncBlockTexts(content);
  let blockTokenIndex = 0;
  let sentenceTokenIndex = 0;

  const blockRanges = blocks.map((blockText) => {
    const tokenCount = tokenizeForSync(blockText).length;
    const range = {
      start: blockTokenIndex,
      end: blockTokenIndex + tokenCount,
    };
    blockTokenIndex = range.end;
    return range;
  });

  const sentenceRanges = bodySentences.map((sentence) => {
    const tokenCount = tokenizeForSync(sentence.text).length;
    const range = {
      id: sentence.id,
      start: sentenceTokenIndex,
      end: sentenceTokenIndex + tokenCount,
    };
    sentenceTokenIndex = range.end;
    return range;
  });

  return blockRanges.map((blockRange) =>
    sentenceRanges
      .filter(
        (sentenceRange) =>
          blockRange.start !== blockRange.end &&
          sentenceRange.start !== sentenceRange.end &&
          rangesOverlap(
            blockRange.start,
            blockRange.end,
            sentenceRange.start,
            sentenceRange.end,
          ),
      )
      .map((sentenceRange) => sentenceRange.id),
  );
}
