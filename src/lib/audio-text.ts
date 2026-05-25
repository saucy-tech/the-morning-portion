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

function normalizeMatchText(text: string): string {
  return normalizeBlockText(text).toLowerCase();
}

function sentenceRelatesToBlock(sentenceText: string, blockText: string): boolean {
  const sentence = normalizeMatchText(sentenceText);
  const block = normalizeMatchText(blockText);
  if (!sentence || !block) return false;

  if (sentence === block) return true;
  if (block.includes(sentence)) return true;
  if (sentence.includes(block)) return true;
  if (sentence.startsWith(block)) return true;
  if (block.startsWith(sentence)) return true;

  const blockWords = block.split(' ');
  const sentenceWords = sentence.split(' ');
  for (let overlap = Math.min(blockWords.length, sentenceWords.length); overlap > 0; overlap--) {
    const blockSuffix = blockWords.slice(-overlap).join(' ');
    const sentencePrefix = sentenceWords.slice(0, overlap).join(' ');
    if (blockSuffix === sentencePrefix) return true;
  }

  return false;
}

function isShortBlock(blockText: string): boolean {
  return normalizeMatchText(blockText).split(' ').length <= 6;
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
  let cursor = 0;

  return blocks.map((blockText) => {
    const ids: string[] = [];

    while (cursor < bodySentences.length) {
      const sentence = bodySentences[cursor];

      if (!sentenceRelatesToBlock(sentence.text, blockText)) {
        if (ids.length > 0) break;

        const sentenceNorm = normalizeMatchText(sentence.text);
        const blockNorm = normalizeMatchText(blockText);
        if (sentenceNorm.startsWith(blockNorm)) {
          ids.push(sentence.id);
          cursor++;
        }
        break;
      }

      ids.push(sentence.id);
      cursor++;

      if (isShortBlock(blockText)) {
        const sentenceNorm = normalizeMatchText(sentence.text);
        const blockNorm = normalizeMatchText(blockText);
        if (sentenceNorm.length > blockNorm.length) break;
      }
    }

    return ids;
  });
}
