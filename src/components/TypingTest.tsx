import React, { useState, useCallback, useRef, useEffect } from "react";
import { Effect } from "effect";
import { Keyboard, FingerLegend } from "./Keyboard.tsx";
import { WordDisplay } from "./WordDisplay.tsx";
import { WordSkeleton, OfflineNotice } from "./WordSkeleton.tsx";
import { FingerIndicator } from "./FingerIndicator.tsx";
import { InlineKeyboard } from "./InlineKeyboard.tsx";
import { Hand } from "../core/keyboard/layout.ts";
import { getRandomWords } from "../core/words/filter.ts";
import { LEFT_HAND_WORDS, RIGHT_HAND_WORDS, COMMON_WORDS } from "../core/words/wordlist.ts";
import {
  fetchAllWords,
  fetchLeftHandWords,
  fetchRightHandWords,
} from "../core/words/monkeytype.ts";
import {
  calculateWPM,
  calculateAccuracy,
  TimingSession,
  type TimingSessionState,
} from "../core/timing/wpm.ts";

type Mode = "all" | "left" | "right";

interface TestState {
  mode: Mode;
  words: string[];
  text: string; // words joined by spaces - the canonical input sequence
  currentPosition: number; // index into text
  typedChars: Map<number, boolean>; // position -> isCorrect
  session: TimingSessionState;
  isComplete: boolean;
  isFocused: boolean;
  isLoading: boolean;
  fetchError: string | null;
}

const WORD_COUNT = 25;

// Cache fetched words by mode - instant switching after first load
const wordCache = new Map<Mode, string[]>();

// Get fallback words from static lists
function getFallbackWords(mode: Mode): string[] {
  switch (mode) {
    case "left":
      return getRandomWords(LEFT_HAND_WORDS, WORD_COUNT);
    case "right":
      return getRandomWords(RIGHT_HAND_WORDS, WORD_COUNT);
    default:
      return getRandomWords(COMMON_WORDS, WORD_COUNT);
  }
}

// Fetch words from MonkeyType word lists
async function fetchWordsForMode(mode: Mode): Promise<string[]> {
  // Use 10k list for more variety (hand modes will filter down significantly)
  const list = "english_10k";

  switch (mode) {
    case "left":
      return Effect.runPromise(fetchLeftHandWords(list));
    case "right":
      return Effect.runPromise(fetchRightHandWords(list));
    default:
      return Effect.runPromise(fetchAllWords(list));
  }
}

// Convert a position in the joined text to word and character indices
function positionToIndices(
  words: string[],
  position: number
): { wordIndex: number; charIndex: number } {
  let remaining = position;
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const wordLen = words[wordIndex].length;
    if (remaining < wordLen) {
      return { wordIndex, charIndex: remaining };
    }
    remaining -= wordLen;
    // Account for space after word (except last word)
    if (wordIndex < words.length - 1) {
      if (remaining === 0) {
        // Position is at the space after this word
        return { wordIndex, charIndex: wordLen }; // charIndex at word length means "at space"
      }
      remaining -= 1; // skip the space
    }
  }
  // Past the end
  const lastWordIndex = words.length - 1;
  return { wordIndex: lastWordIndex, charIndex: words[lastWordIndex]?.length ?? 0 };
}

function initialState(mode: Mode = "all"): TestState {
  // Use cached words if available, otherwise start with fallback
  const cached = wordCache.get(mode);
  const words = cached ? getRandomWords(cached, WORD_COUNT) : getFallbackWords(mode);
  return {
    mode,
    words,
    text: words.join(" "),
    currentPosition: 0,
    typedChars: new Map(),
    session: TimingSession.create(),
    isComplete: false,
    isFocused: false,
    isLoading: !cached, // Only loading if not cached
    fetchError: null,
  };
}

export function TypingTest() {
  const [state, setState] = useState<TestState>(() => initialState());
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive word/char indices from position for display purposes
  const { wordIndex: currentWordIndex, charIndex: currentCharIndex } = positionToIndices(
    state.words,
    state.currentPosition
  );
  const currentChar = state.text[state.currentPosition];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (state.isComplete) return;

      const key = e.key;

      // Prevent space from scrolling
      if (key === " ") {
        e.preventDefault();
      }

      // Start timer on first keystroke
      setState((prev) => {
        if (!prev.session.isRunning && !prev.isComplete) {
          return { ...prev, session: TimingSession.start(prev.session) };
        }
        return prev;
      });

      if (key === "Backspace") {
        e.preventDefault();
        setState((prev) => {
          if (prev.currentPosition > 0) {
            const newTypedChars = new Map(prev.typedChars);
            newTypedChars.delete(prev.currentPosition - 1);
            return {
              ...prev,
              currentPosition: prev.currentPosition - 1,
              typedChars: newTypedChars,
            };
          }
          return prev;
        });
        return;
      }

      // Only process single printable characters (including space)
      if (key.length !== 1) return;

      setState((prev) => {
        // Already at end of text
        if (prev.currentPosition >= prev.text.length) {
          return prev;
        }

        const expectedChar = prev.text[prev.currentPosition];
        const isCorrect = key === expectedChar;

        const newTypedChars = new Map(prev.typedChars);
        newTypedChars.set(prev.currentPosition, isCorrect);

        const newSession = TimingSession.addCharacter(prev.session, isCorrect);
        const nextPosition = prev.currentPosition + 1;

        // Check if test is complete
        if (nextPosition >= prev.text.length) {
          return {
            ...prev,
            currentPosition: nextPosition,
            typedChars: newTypedChars,
            session: TimingSession.stop(newSession),
            isComplete: true,
          };
        }

        return {
          ...prev,
          currentPosition: nextPosition,
          typedChars: newTypedChars,
          session: newSession,
        };
      });
    },
    [state.isComplete],
  );

  const handleFocus = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: true }));
  }, []);

  const handleBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isFocused: false }));
  }, []);

  const handleModeChange = useCallback((mode: Mode) => {
    setState({ ...initialState(mode), isFocused: true });
    inputRef.current?.focus();
  }, []);

  const handleRestart = useCallback(() => {
    setState((prev) => ({ ...initialState(prev.mode), isFocused: true }));
    inputRef.current?.focus();
  }, []);

  const handleRetry = useCallback(() => {
    // Clear cache for current mode and refetch
    wordCache.delete(state.mode);
    setState((prev) => ({ ...prev, isLoading: true, fetchError: null }));

    fetchWordsForMode(state.mode)
      .then((fetchedWords) => {
        wordCache.set(state.mode, fetchedWords);
        const newWords = getRandomWords(fetchedWords, WORD_COUNT);
        setState((prev) => ({
          ...prev,
          words: newWords,
          text: newWords.join(" "),
          isLoading: false,
          fetchError: null,
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          fetchError: "offline",
        }));
      });
  }, [state.mode]);

  const focusInput = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent blur from happening
    inputRef.current?.focus();
  }, []);

  // Calculate stats
  const duration = TimingSession.getDuration(state.session);
  const correctChars = state.session.characterCount - state.session.errorCount;
  const grossWpm =
    state.session.characterCount > 0
      ? Effect.runSync(calculateWPM(state.session.characterCount, Math.max(duration, 1)))
      : 0;
  const netWpm =
    correctChars > 0
      ? Effect.runSync(calculateWPM(correctChars, Math.max(duration, 1)))
      : 0;

  const accuracy =
    state.session.characterCount > 0
      ? Effect.runSync(calculateAccuracy(state.session.characterCount, state.session.errorCount))
      : 100;

  // Fetch words when mode changes
  useEffect(() => {
    let cancelled = false;

    // Check cache first - instant if available
    const cached = wordCache.get(state.mode);
    if (cached) {
      const newWords = getRandomWords(cached, WORD_COUNT);
      setState((prev) => ({
        ...prev,
        words: newWords,
        text: newWords.join(" "),
        isLoading: false,
        fetchError: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, fetchError: null }));

    fetchWordsForMode(state.mode)
      .then((fetchedWords) => {
        if (!cancelled) {
          wordCache.set(state.mode, fetchedWords); // Cache for later
          const newWords = getRandomWords(fetchedWords, WORD_COUNT);
          setState((prev) => ({
            ...prev,
            words: newWords,
            text: newWords.join(" "),
            isLoading: false,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to static list
          const fallback = getFallbackWords(state.mode);
          setState((prev) => ({
            ...prev,
            words: fallback,
            text: fallback.join(" "),
            isLoading: false,
            fetchError: "offline",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.mode]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getModeLabel = () => {
    switch (state.mode) {
      case "left": return "left hand training";
      case "right": return "right hand training";
      default: return "all fingers";
    }
  };

  return (
    <div className="app">
      {/* Corner stats - left */}
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Speed</div>
          <div className="stat-value">
            {state.isComplete ? netWpm : state.session.isRunning ? netWpm : "—"} <span>wpm</span>
          </div>
          {(state.session.isRunning || state.isComplete) && grossWpm !== netWpm && (
            <div className="stat-secondary">
              {grossWpm} <span>raw</span>
            </div>
          )}
        </div>
      </div>

      {/* Corner stats - right */}
      <div className="stats-right">
        <div className="stat stat-right">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value">
            {state.session.isRunning || state.isComplete ? accuracy : "—"}<span>%</span>
          </div>
        </div>
        <div className="stat stat-right">
          <div className="stat-label">Progress</div>
          <div className="stat-value">
            {currentWordIndex}<span>/{state.words.length}</span>
          </div>
        </div>
      </div>

      <header className="header">
        <h1>Zen Flow</h1>
        <p>{getModeLabel()}</p>
      </header>

      <div className="mode-selector">
        <button
          className={`mode-btn ${state.mode === "all" ? "active" : ""}`}
          onClick={() => handleModeChange("all")}
          onMouseDown={(e) => e.preventDefault()}
        >
          All
        </button>
        <button
          className={`mode-btn ${state.mode === "left" ? "active" : ""}`}
          onClick={() => handleModeChange("left")}
          onMouseDown={(e) => e.preventDefault()}
        >
          Left Hand
        </button>
        <button
          className={`mode-btn ${state.mode === "right" ? "active" : ""}`}
          onClick={() => handleModeChange("right")}
          onMouseDown={(e) => e.preventDefault()}
        >
          Right Hand
        </button>
      </div>

      <div className="typing-area" onMouseDown={focusInput}>
        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {!state.isFocused && !state.isComplete && (
          <div className="focus-message">Click here or press any key to focus</div>
        )}
        {state.mode !== "all" && !state.isLoading && (
          <FingerIndicator currentChar={currentChar} mode={state.mode} />
        )}
        {state.isLoading ? (
          <WordSkeleton />
        ) : (
          <>
            {state.fetchError && <OfflineNotice onRetry={handleRetry} />}
            <div className="words-enter">
              <WordDisplay
                text={state.text}
                currentPosition={state.currentPosition}
                typedChars={state.typedChars}
                showFingerHints={true}
                showInlineKeyHint={false}
              />
            </div>
            {state.mode !== "all" && !state.isComplete && (
              <InlineKeyboard activeKey={currentChar} mode={state.mode} />
            )}
          </>
        )}
      </div>

      {state.isComplete && (
        <div className="results">
          <h2>Complete</h2>
          <div className="results-stats">
            <div className="stat">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{netWpm} <span>wpm</span></div>
              {grossWpm !== netWpm && (
                <div className="stat-secondary">
                  {grossWpm} <span>raw</span>
                </div>
              )}
            </div>
            <div className="stat">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{accuracy}<span>%</span></div>
            </div>
            <div className="stat">
              <div className="stat-label">Time</div>
              <div className="stat-value">{Math.round(duration / 1000)}<span>s</span></div>
            </div>
          </div>
          <button
            className="btn"
            onClick={handleRestart}
            onMouseDown={(e) => e.preventDefault()}
            title="Try Again"
          >
            <span className="material-symbols-outlined">replay</span>
          </button>
        </div>
      )}

      <div className="controls">
        <button
          className="btn"
          onClick={handleRestart}
          onMouseDown={(e) => e.preventDefault()}
          title="Restart"
        >
          <span className="material-symbols-outlined">replay</span>
        </button>
      </div>

      {state.mode === "all" && (
        <Keyboard activeKey={currentChar} showFingerColors={true} mode={state.mode} />
      )}
      {state.mode !== "all" && <FingerLegend mode={state.mode} />}
    </div>
  );
}
