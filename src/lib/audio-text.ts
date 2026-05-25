const SENTENCE_END = /[.!?]+(?:\s|$)/;

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
