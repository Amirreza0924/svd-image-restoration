/** Splits text into individual words for word-by-word reveal animations. */
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}
