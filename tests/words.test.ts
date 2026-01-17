import { describe, expect, test } from "bun:test";
import {
  isLeftHandWord,
  isRightHandWord,
  isSingleHandWord,
  filterLeftHandWords,
  filterRightHandWords,
  getRandomWords,
} from "../src/core/words/filter.ts";
import { Hand } from "../src/core/keyboard/layout.ts";
import { LEFT_HAND_WORDS, RIGHT_HAND_WORDS } from "../src/core/words/wordlist.ts";

describe("Word Filtering", () => {
  describe("isLeftHandWord", () => {
    test("returns true for words typed with left hand only", () => {
      expect(isLeftHandWord("great")).toBe(true);
      expect(isLeftHandWord("better")).toBe(true);
      expect(isLeftHandWord("west")).toBe(true);
      expect(isLeftHandWord("rest")).toBe(true);
      expect(isLeftHandWord("crave")).toBe(true);
    });

    test("returns false for words requiring right hand", () => {
      expect(isLeftHandWord("hello")).toBe(false);
      expect(isLeftHandWord("typing")).toBe(false);
      expect(isLeftHandWord("world")).toBe(false);
    });

    test("handles uppercase", () => {
      expect(isLeftHandWord("GREAT")).toBe(true);
      expect(isLeftHandWord("Great")).toBe(true);
    });

    test("returns false for empty string", () => {
      expect(isLeftHandWord("")).toBe(false);
    });
  });

  describe("isRightHandWord", () => {
    test("returns true for words typed with right hand only", () => {
      expect(isRightHandWord("look")).toBe(true);
      expect(isRightHandWord("million")).toBe(true);
      expect(isRightHandWord("opinion")).toBe(true);
      expect(isRightHandWord("hull")).toBe(true);
    });

    test("returns false for words requiring left hand", () => {
      expect(isRightHandWord("great")).toBe(false);
      expect(isRightHandWord("hello")).toBe(false);
    });

    test("handles uppercase", () => {
      expect(isRightHandWord("LOOK")).toBe(true);
    });

    test("returns false for empty string", () => {
      expect(isRightHandWord("")).toBe(false);
    });
  });

  describe("isSingleHandWord", () => {
    test("returns Hand.Left for left hand words", () => {
      expect(isSingleHandWord("great")).toBe(Hand.Left);
    });

    test("returns Hand.Right for right hand words", () => {
      expect(isSingleHandWord("look")).toBe(Hand.Right);
    });

    test("returns undefined for words requiring both hands", () => {
      expect(isSingleHandWord("hello")).toBeUndefined();
      expect(isSingleHandWord("world")).toBeUndefined();
    });
  });

  describe("filterLeftHandWords", () => {
    test("filters array to only left hand words", () => {
      const words = ["great", "hello", "west", "world", "crave"];
      const filtered = filterLeftHandWords(words);
      expect(filtered).toEqual(["great", "west", "crave"]);
    });
  });

  describe("filterRightHandWords", () => {
    test("filters array to only right hand words", () => {
      const words = ["look", "hello", "hull", "world", "opinion"];
      const filtered = filterRightHandWords(words);
      expect(filtered).toEqual(["look", "hull", "opinion"]);
    });
  });

  describe("getRandomWords", () => {
    test("returns requested number of words", () => {
      const words = ["one", "two", "three", "four", "five"];
      const result = getRandomWords(words, 3);
      expect(result).toHaveLength(3);
    });

    test("returns all words if count exceeds array length", () => {
      const words = ["one", "two"];
      const result = getRandomWords(words, 5);
      expect(result).toHaveLength(2);
    });

    test("returns empty array for empty input", () => {
      const result = getRandomWords([], 5);
      expect(result).toEqual([]);
    });
  });

  describe("Static Word Lists Validation", () => {
    test("LEFT_HAND_WORDS contains only valid left-hand words", () => {
      const invalidWords = LEFT_HAND_WORDS.filter((word) => !isLeftHandWord(word));
      expect(invalidWords).toEqual([]);
    });

    test("RIGHT_HAND_WORDS contains only valid right-hand words", () => {
      const invalidWords = RIGHT_HAND_WORDS.filter((word) => !isRightHandWord(word));
      expect(invalidWords).toEqual([]);
    });

    test("LEFT_HAND_WORDS has sufficient words for practice", () => {
      expect(LEFT_HAND_WORDS.length).toBeGreaterThanOrEqual(25);
    });

    test("RIGHT_HAND_WORDS has sufficient words for practice", () => {
      expect(RIGHT_HAND_WORDS.length).toBeGreaterThanOrEqual(25);
    });
  });
});
