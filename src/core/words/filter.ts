import { Hand, getHandForKey } from "../keyboard/layout.ts";

export function isLeftHandWord(word: string): boolean {
  if (word.length === 0) return false;
  return [...word.toLowerCase()].every((char) => getHandForKey(char) === Hand.Left);
}

export function isRightHandWord(word: string): boolean {
  if (word.length === 0) return false;
  return [...word.toLowerCase()].every((char) => getHandForKey(char) === Hand.Right);
}

export function isSingleHandWord(word: string): Hand | undefined {
  if (isLeftHandWord(word)) return Hand.Left;
  if (isRightHandWord(word)) return Hand.Right;
  return undefined;
}

export function filterLeftHandWords(words: string[]): string[] {
  return words.filter(isLeftHandWord);
}

export function filterRightHandWords(words: string[]): string[] {
  return words.filter(isRightHandWord);
}

export function getRandomWords(words: string[], count: number): string[] {
  if (words.length === 0) return [];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}
