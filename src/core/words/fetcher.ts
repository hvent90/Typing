import { Effect, Data } from "effect";

export class FetchError extends Data.TaggedError("FetchError")<{
  readonly message: string;
}> {}

export interface DatamuseWord {
  word: string;
  score: number;
  tags?: string[];
}

export interface FetchOptions {
  minLength?: number;
  maxLength?: number;
  minFrequency?: number;
  startsWith?: string;
  max?: number;
}

const DATAMUSE_BASE_URL = "https://api.datamuse.com/words";

/**
 * Build a Datamuse API URL for a specific word length
 */
export function buildDatamuseUrl(options: FetchOptions, length?: number): string {
  const params = new URLSearchParams();

  // Build spelling pattern
  let pattern = "";
  if (options.startsWith) {
    pattern = options.startsWith;
  }

  if (length !== undefined) {
    pattern += "?".repeat(length - (options.startsWith?.length ?? 0));
  } else if (options.minLength && options.minLength === options.maxLength) {
    pattern += "?".repeat(options.minLength - (options.startsWith?.length ?? 0));
  } else {
    pattern += "*";
  }

  params.set("sp", pattern);
  params.set("md", "fp"); // Include frequency and parts of speech metadata
  params.set("max", String(options.max ?? 1000));

  return `${DATAMUSE_BASE_URL}?${params.toString()}`;
}

/**
 * Extract frequency value from Datamuse tags
 */
function getFrequency(tags?: string[]): number | undefined {
  if (!tags) return undefined;
  const freqTag = tags.find((t) => t.startsWith("f:"));
  if (!freqTag) return undefined;
  return parseFloat(freqTag.slice(2));
}

/**
 * Check if word contains only alphabetic characters
 */
function isAlphaOnly(word: string): boolean {
  return /^[a-zA-Z]+$/.test(word);
}

/**
 * Check if word looks like an abbreviation or non-word
 * Filters out: repeated letters (iii, ooo), all caps abbreviations, etc.
 */
function isLikelyRealWord(word: string): boolean {
  // Filter out words with 3+ repeated consecutive letters
  if (/(.)\1\1/.test(word)) return false;

  // Filter out common abbreviation patterns (all same letter)
  if (/^(.)\1+$/.test(word)) return false;

  return true;
}

/**
 * Check if word is a proper noun (name, place, etc.)
 */
function isProperNoun(tags?: string[]): boolean {
  return tags?.includes("prop") ?? false;
}

/**
 * Parse and filter Datamuse API response
 */
export function parseDatamuseResponse(response: DatamuseWord[], options: FetchOptions): string[] {
  return response
    .filter((item) => {
      // Filter out non-alpha words
      if (!isAlphaOnly(item.word)) return false;

      // Filter out abbreviations and non-words
      if (!isLikelyRealWord(item.word)) return false;

      // Filter out proper nouns (names, places)
      if (isProperNoun(item.tags)) return false;

      // Filter by frequency if specified
      if (options.minFrequency !== undefined) {
        const freq = getFrequency(item.tags);
        if (freq === undefined || freq < options.minFrequency) return false;
      }

      return true;
    })
    .map((item) => item.word.toLowerCase());
}

/**
 * Fetch a single batch of words from Datamuse
 */
function fetchBatch(url: string): Effect.Effect<DatamuseWord[], FetchError> {
  return Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (error) => new FetchError({ message: `Network error: ${error}` }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new FetchError({ message: `HTTP ${response.status}: ${response.statusText}` }),
      );
    }

    const data = yield* Effect.tryPromise({
      try: () => response.json() as Promise<DatamuseWord[]>,
      catch: (error) => new FetchError({ message: `JSON parse error: ${error}` }),
    });

    return data;
  });
}

/**
 * Fetch words from Datamuse API
 *
 * @param options - Filtering options
 * @returns Effect containing array of words
 *
 * @example
 * // Fetch 4-letter words with frequency > 5
 * const words = await Effect.runPromise(
 *   fetchWords({ minLength: 4, maxLength: 4, minFrequency: 5 })
 * );
 */
export function fetchWords(options: FetchOptions): Effect.Effect<string[], FetchError> {
  return Effect.gen(function* () {
    const minLen = options.minLength ?? 3;
    const maxLen = options.maxLength ?? 8;

    // If range is specified, fetch multiple lengths
    if (minLen !== maxLen) {
      const lengths = Array.from({ length: maxLen - minLen + 1 }, (_, i) => minLen + i);

      const batches = yield* Effect.all(
        lengths.map((len) => {
          const url = buildDatamuseUrl(options, len);
          return fetchBatch(url);
        }),
        { concurrency: 3 },
      );

      const allWords = batches.flat();
      return parseDatamuseResponse(allWords, options);
    }

    // Single length query
    const url = buildDatamuseUrl(options);
    const data = yield* fetchBatch(url);
    return parseDatamuseResponse(data, options);
  });
}

// Hand-specific letter sets
const LEFT_HAND_LETTERS = ["q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v", "b"];
const RIGHT_HAND_LETTERS = ["y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m"];

/**
 * Fetch words for a specific hand by querying each starting letter
 * This produces better results than fetching all words and filtering
 */
function fetchWordsByStartingLetters(
  letters: string[],
  filterFn: (words: string[]) => string[],
  options: FetchOptions,
): Effect.Effect<string[], FetchError> {
  return Effect.gen(function* () {
    const minLen = options.minLength ?? 3;
    const maxLen = options.maxLength ?? 8;
    const lengths = Array.from({ length: maxLen - minLen + 1 }, (_, i) => minLen + i);

    // Build all letter+length combinations
    const queries: Array<{ letter: string; length: number }> = [];
    for (const letter of letters) {
      for (const length of lengths) {
        queries.push({ letter, length });
      }
    }

    // Fetch all combinations in parallel (limited concurrency)
    const batches = yield* Effect.all(
      queries.map(({ letter, length }) => {
        const pattern = letter + "?".repeat(length - 1);
        const url = `${DATAMUSE_BASE_URL}?sp=${pattern}&md=fp&max=100`;
        return fetchBatch(url);
      }),
      { concurrency: 6 },
    );

    // Combine and filter results
    const allWords = batches.flat();
    const parsed = parseDatamuseResponse(allWords, options);

    // Filter for the specific hand and deduplicate
    const filtered = filterFn(parsed);
    return [...new Set(filtered)];
  });
}

/**
 * Fetch words and filter for left-hand typing
 */
export function fetchLeftHandWords(options: FetchOptions): Effect.Effect<string[], FetchError> {
  return Effect.gen(function* () {
    const { filterLeftHandWords } = yield* Effect.tryPromise({
      try: () => import("./filter.ts"),
      catch: (e) => new FetchError({ message: `Import error: ${e}` }),
    });

    return yield* fetchWordsByStartingLetters(LEFT_HAND_LETTERS, filterLeftHandWords, options);
  });
}

/**
 * Fetch words and filter for right-hand typing
 */
export function fetchRightHandWords(options: FetchOptions): Effect.Effect<string[], FetchError> {
  return Effect.gen(function* () {
    const { filterRightHandWords } = yield* Effect.tryPromise({
      try: () => import("./filter.ts"),
      catch: (e) => new FetchError({ message: `Import error: ${e}` }),
    });

    return yield* fetchWordsByStartingLetters(RIGHT_HAND_LETTERS, filterRightHandWords, options);
  });
}
