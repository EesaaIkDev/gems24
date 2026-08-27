/** Counts whitespace-separated words. */
export const countWords = (text = "") => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Trims text down to at most `max` words, keeping trailing spaces while typing. */
export function limitWords(text = "", max) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ");
}