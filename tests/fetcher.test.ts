import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { Effect } from "effect";
import {
  fetchWords,
  parseDatamuseResponse,
  buildDatamuseUrl,
  FetchError,
  type DatamuseWord,
  type FetchOptions,
} from "../src/core/words/fetcher.ts";

describe("Datamuse Word Fetcher", () => {
  describe("buildDatamuseUrl", () => {
    test("builds URL with default options", () => {
      const url = buildDatamuseUrl({});
      expect(url).toContain("api.datamuse.com/words");
      expect(url).toContain("sp=");
      expect(url).toContain("md=f");
      expect(url).toContain("max=1000");
    });

    test("builds URL with specific word length", () => {
      const url = buildDatamuseUrl({ minLength: 4, maxLength: 4 });
      // URL encodes ? as %3F
      expect(url).toContain("sp=%3F%3F%3F%3F");
    });

    test("builds URL with length range", () => {
      const url = buildDatamuseUrl({ minLength: 3, maxLength: 5 });
      // Should make multiple queries or use pattern
      expect(url).toContain("sp=");
    });

    test("builds URL with starting letter pattern", () => {
      const url = buildDatamuseUrl({ startsWith: "a" });
      expect(url).toContain("sp=a");
    });
  });

  describe("parseDatamuseResponse", () => {
    test("extracts words from response", () => {
      const response: DatamuseWord[] = [
        { word: "hello", score: 100, tags: ["f:45.2"] },
        { word: "world", score: 90, tags: ["f:30.1"] },
      ];
      const words = parseDatamuseResponse(response, {});
      expect(words).toContain("hello");
      expect(words).toContain("world");
    });

    test("filters by minimum frequency", () => {
      const response: DatamuseWord[] = [
        { word: "common", score: 100, tags: ["f:50.0"] },
        { word: "rare", score: 90, tags: ["f:0.5"] },
      ];
      const words = parseDatamuseResponse(response, { minFrequency: 10 });
      expect(words).toContain("common");
      expect(words).not.toContain("rare");
    });

    test("handles missing frequency tags", () => {
      const response: DatamuseWord[] = [
        { word: "nofreq", score: 100 },
        { word: "hasfreq", score: 90, tags: ["f:25.0"] },
      ];
      const words = parseDatamuseResponse(response, { minFrequency: 1 });
      // Words without frequency should be excluded when filtering by frequency
      expect(words).not.toContain("nofreq");
      expect(words).toContain("hasfreq");
    });

    test("filters out words with non-alpha characters", () => {
      const response: DatamuseWord[] = [
        { word: "clean", score: 100, tags: ["f:20.0"] },
        { word: "don't", score: 90, tags: ["f:20.0"] },
        { word: "e-mail", score: 80, tags: ["f:20.0"] },
      ];
      const words = parseDatamuseResponse(response, {});
      expect(words).toContain("clean");
      expect(words).not.toContain("don't");
      expect(words).not.toContain("e-mail");
    });

    test("converts words to lowercase", () => {
      const response: DatamuseWord[] = [{ word: "Hello", score: 100, tags: ["f:20.0"] }];
      const words = parseDatamuseResponse(response, {});
      expect(words).toContain("hello");
      expect(words).not.toContain("Hello");
    });
  });

  describe("fetchWords", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    test("returns words from successful fetch", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { word: "test", score: 100, tags: ["f:20.0"] },
              { word: "word", score: 90, tags: ["f:15.0"] },
            ]),
        } as Response),
      );

      const result = await Effect.runPromise(fetchWords({}));
      expect(result).toContain("test");
      expect(result).toContain("word");
    });

    test("fails on network error", async () => {
      globalThis.fetch = mock(() => Promise.reject(new Error("Network error")));

      const result = await Effect.runPromiseExit(fetchWords({}));
      expect(result._tag).toBe("Failure");
    });

    test("fails on non-ok response", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        } as Response),
      );

      const result = await Effect.runPromiseExit(fetchWords({}));
      expect(result._tag).toBe("Failure");
    });

    test("fetches multiple lengths when range specified", async () => {
      const fetchCalls: string[] = [];
      globalThis.fetch = mock((url: string) => {
        fetchCalls.push(url);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ word: "test", score: 100, tags: ["f:20.0"] }]),
        } as Response);
      });

      await Effect.runPromise(fetchWords({ minLength: 3, maxLength: 5 }));
      // Should fetch for lengths 3, 4, and 5
      expect(fetchCalls.length).toBe(3);
    });
  });
});
