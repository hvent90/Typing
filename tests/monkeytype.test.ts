import { describe, expect, test, mock, afterEach } from "bun:test";
import { Effect } from "effect";
import {
  fetchMonkeyTypeWords,
  fetchLeftHandWords,
  fetchRightHandWords,
  fetchAllWords,
  MONKEYTYPE_BASE_URL,
  FetchError,
  type WordList,
} from "../src/core/words/monkeytype.ts";
import { isLeftHandWord, isRightHandWord } from "../src/core/words/filter.ts";

describe("MonkeyType Word Fetcher", () => {
  const originalFetch = globalThis.fetch;

  const mockMonkeyTypeResponse = (words: string[]) => ({
    name: "english",
    orderedByFrequency: true,
    words,
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("fetchMonkeyTypeWords", () => {
    test("fetches words from correct URL", async () => {
      let fetchedUrl = "";
      globalThis.fetch = mock((url: string) => {
        fetchedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["the", "be", "to"])),
        } as Response);
      });

      await Effect.runPromise(fetchMonkeyTypeWords("english_1k"));
      expect(fetchedUrl).toBe(`${MONKEYTYPE_BASE_URL}/english_1k.json`);
    });

    test("returns words array from response", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["hello", "world", "test"])),
        } as Response),
      );

      const result = await Effect.runPromise(fetchMonkeyTypeWords("english"));
      expect(result).toEqual(["hello", "world", "test"]);
    });

    test("defaults to english_1k word list", async () => {
      let fetchedUrl = "";
      globalThis.fetch = mock((url: string) => {
        fetchedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["test"])),
        } as Response);
      });

      await Effect.runPromise(fetchMonkeyTypeWords());
      expect(fetchedUrl).toContain("english_1k.json");
    });

    test("fails on network error", async () => {
      globalThis.fetch = mock(() => Promise.reject(new Error("Network error")));

      const result = await Effect.runPromiseExit(fetchMonkeyTypeWords());
      expect(result._tag).toBe("Failure");
    });

    test("fails on non-ok response", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
        } as Response),
      );

      const result = await Effect.runPromiseExit(fetchMonkeyTypeWords());
      expect(result._tag).toBe("Failure");
    });

    test("supports different word list sizes", async () => {
      const lists: WordList[] = ["english", "english_1k", "english_5k", "english_10k"];
      const fetchedUrls: string[] = [];

      globalThis.fetch = mock((url: string) => {
        fetchedUrls.push(url);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["test"])),
        } as Response);
      });

      for (const list of lists) {
        await Effect.runPromise(fetchMonkeyTypeWords(list));
      }

      expect(fetchedUrls).toContain(`${MONKEYTYPE_BASE_URL}/english.json`);
      expect(fetchedUrls).toContain(`${MONKEYTYPE_BASE_URL}/english_1k.json`);
      expect(fetchedUrls).toContain(`${MONKEYTYPE_BASE_URL}/english_5k.json`);
      expect(fetchedUrls).toContain(`${MONKEYTYPE_BASE_URL}/english_10k.json`);
    });
  });

  describe("fetchLeftHandWords", () => {
    test("filters words for left hand only", async () => {
      // Mix of left-hand and non-left-hand words
      const words = ["state", "create", "water", "hello", "world", "test", "great"];
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(words)),
        } as Response),
      );

      const result = await Effect.runPromise(fetchLeftHandWords());

      // All returned words should be left-hand words
      for (const word of result) {
        expect(isLeftHandWord(word)).toBe(true);
      }

      // Should not contain words that require right hand
      expect(result).not.toContain("hello");
      expect(result).not.toContain("world");
    });

    test("passes word list option through", async () => {
      let fetchedUrl = "";
      globalThis.fetch = mock((url: string) => {
        fetchedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["test"])),
        } as Response);
      });

      await Effect.runPromise(fetchLeftHandWords("english_10k"));
      expect(fetchedUrl).toContain("english_10k.json");
    });
  });

  describe("fetchRightHandWords", () => {
    test("filters words for right hand only", async () => {
      // Mix of right-hand and non-right-hand words
      const words = ["opinion", "million", "hello", "world", "ink", "him", "oil"];
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(words)),
        } as Response),
      );

      const result = await Effect.runPromise(fetchRightHandWords());

      // All returned words should be right-hand words
      for (const word of result) {
        expect(isRightHandWord(word)).toBe(true);
      }

      // Should not contain words that require left hand
      expect(result).not.toContain("hello");
      expect(result).not.toContain("world");
    });

    test("passes word list option through", async () => {
      let fetchedUrl = "";
      globalThis.fetch = mock((url: string) => {
        fetchedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(["test"])),
        } as Response);
      });

      await Effect.runPromise(fetchRightHandWords("english_5k"));
      expect(fetchedUrl).toContain("english_5k.json");
    });
  });

  describe("fetchAllWords", () => {
    test("returns all words without filtering", async () => {
      const words = ["hello", "world", "test", "state", "ink"];
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMonkeyTypeResponse(words)),
        } as Response),
      );

      const result = await Effect.runPromise(fetchAllWords());
      expect(result).toEqual(words);
    });
  });
});

describe("Real data integration test", () => {
  test("fetchLeftHandWords returns no words with right-hand letters", async () => {
    // Actually fetch from MonkeyType (no mock)
    const result = await Effect.runPromise(fetchLeftHandWords("english_1k"));

    const RIGHT_HAND_LETTERS = ["y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m"];

    const invalidWords = result.filter((word) =>
      [...word].some((char) => RIGHT_HAND_LETTERS.includes(char.toLowerCase())),
    );

    expect(invalidWords).toEqual([]);
  });

  test("fetchRightHandWords returns no words with left-hand letters", async () => {
    // Actually fetch from MonkeyType (no mock)
    const result = await Effect.runPromise(fetchRightHandWords("english_1k"));

    const LEFT_HAND_LETTERS = ["q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v", "b"];

    const invalidWords = result.filter((word) =>
      [...word].some((char) => LEFT_HAND_LETTERS.includes(char.toLowerCase())),
    );

    expect(invalidWords).toEqual([]);
  });
});
