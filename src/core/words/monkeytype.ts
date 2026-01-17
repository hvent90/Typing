import { Effect, Data } from "effect";
import { filterLeftHandWords, filterRightHandWords } from "./filter.ts";

export class FetchError extends Data.TaggedError("FetchError")<{
  readonly message: string;
}> {}

export const MONKEYTYPE_BASE_URL =
  "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/languages";

export type WordList = "english" | "english_1k" | "english_5k" | "english_10k" | "english_25k";

interface MonkeyTypeResponse {
  name: string;
  orderedByFrequency: boolean;
  words: string[];
}

/**
 * Fetch words from MonkeyType's GitHub-hosted word lists
 *
 * @param list - Which word list to fetch (default: english_1k)
 * @returns Effect containing array of words
 */
export function fetchMonkeyTypeWords(
  list: WordList = "english_1k",
): Effect.Effect<string[], FetchError> {
  return Effect.gen(function* () {
    const url = `${MONKEYTYPE_BASE_URL}/${list}.json`;

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
      try: () => response.json() as Promise<MonkeyTypeResponse>,
      catch: (error) => new FetchError({ message: `JSON parse error: ${error}` }),
    });

    return data.words;
  });
}

/**
 * Fetch words filtered for left-hand typing only
 */
export function fetchLeftHandWords(
  list: WordList = "english_1k",
): Effect.Effect<string[], FetchError> {
  return fetchMonkeyTypeWords(list).pipe(Effect.map(filterLeftHandWords));
}

/**
 * Fetch words filtered for right-hand typing only
 */
export function fetchRightHandWords(
  list: WordList = "english_1k",
): Effect.Effect<string[], FetchError> {
  return fetchMonkeyTypeWords(list).pipe(Effect.map(filterRightHandWords));
}

/**
 * Fetch all words without hand filtering
 */
export function fetchAllWords(list: WordList = "english_1k"): Effect.Effect<string[], FetchError> {
  return fetchMonkeyTypeWords(list);
}
