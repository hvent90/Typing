import React, { useState, useCallback, useRef, useEffect } from "react";
import { Effect } from "effect";
import { Keyboard, FingerLegend } from "./Keyboard.tsx";
import { WordDisplay } from "./WordDisplay.tsx";
import { Hand } from "../core/keyboard/layout.ts";
import { filterLeftHandWords, filterRightHandWords, getRandomWords } from "../core/words/filter.ts";
import { LEFT_HAND_WORDS, RIGHT_HAND_WORDS, COMMON_WORDS } from "../core/words/wordlist.ts";
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
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, boolean>;
  session: TimingSessionState;
  isComplete: boolean;
  isFocused: boolean;
}

const WORD_COUNT = 25;

function getWordsForMode(mode: Mode): string[] {
  switch (mode) {
    case "left":
      return getRandomWords(LEFT_HAND_WORDS, WORD_COUNT);
    case "right":
      return getRandomWords(RIGHT_HAND_WORDS, WORD_COUNT);
    default:
      return getRandomWords(COMMON_WORDS, WORD_COUNT);
  }
}

function initialState(mode: Mode = "all"): TestState {
  return {
    mode,
    words: getWordsForMode(mode),
    currentWordIndex: 0,
    currentCharIndex: 0,
    typedChars: new Map(),
    session: TimingSession.create(),
    isComplete: false,
    isFocused: false,
  };
}

export function TypingTest() {
  const [state, setState] = useState<TestState>(() => initialState());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = state.words[state.currentWordIndex] ?? "";
  const currentChar = currentWord[state.currentCharIndex];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (state.isComplete) return;

      const key = e.key;

      // Start timer on first keystroke
      setState((prev) => {
        if (!prev.session.isRunning && !prev.isComplete) {
          return { ...prev, session: TimingSession.start(prev.session) };
        }
        return prev;
      });

      if (key === " ") {
        e.preventDefault();
        // Move to next word
        setState((prev) => {
          if (prev.currentCharIndex === 0) return prev; // Don't skip empty words

          const nextWordIndex = prev.currentWordIndex + 1;
          if (nextWordIndex >= prev.words.length) {
            // Test complete
            return {
              ...prev,
              isComplete: true,
              session: TimingSession.stop(prev.session),
            };
          }

          return {
            ...prev,
            currentWordIndex: nextWordIndex,
            currentCharIndex: 0,
          };
        });
        return;
      }

      if (key === "Backspace") {
        e.preventDefault();
        setState((prev) => {
          if (prev.currentCharIndex > 0) {
            const newTypedChars = new Map(prev.typedChars);
            newTypedChars.delete(`${prev.currentWordIndex}-${prev.currentCharIndex - 1}`);
            return {
              ...prev,
              currentCharIndex: prev.currentCharIndex - 1,
              typedChars: newTypedChars,
            };
          }
          return prev;
        });
        return;
      }

      // Only process single characters
      if (key.length !== 1) return;

      setState((prev) => {
        const word = prev.words[prev.currentWordIndex];
        if (!word) return prev;

        const expectedChar = word[prev.currentCharIndex];
        const isCorrect = key === expectedChar;

        const newTypedChars = new Map(prev.typedChars);
        newTypedChars.set(`${prev.currentWordIndex}-${prev.currentCharIndex}`, isCorrect);

        const newSession = TimingSession.addCharacter(prev.session, isCorrect);

        const nextCharIndex = prev.currentCharIndex + 1;

        // Check if word is complete
        if (nextCharIndex >= word.length) {
          const nextWordIndex = prev.currentWordIndex + 1;
          if (nextWordIndex >= prev.words.length) {
            // Test complete
            return {
              ...prev,
              typedChars: newTypedChars,
              session: TimingSession.stop(newSession),
              isComplete: true,
            };
          }
          // Auto-advance to next word
          return {
            ...prev,
            currentWordIndex: nextWordIndex,
            currentCharIndex: 0,
            typedChars: newTypedChars,
            session: newSession,
          };
        }

        return {
          ...prev,
          currentCharIndex: nextCharIndex,
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
    setState(initialState(mode));
    inputRef.current?.focus();
  }, []);

  const handleRestart = useCallback(() => {
    setState((prev) => initialState(prev.mode));
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Calculate stats
  const duration = TimingSession.getDuration(state.session);
  const wpm =
    state.session.characterCount > 0
      ? Effect.runSync(calculateWPM(state.session.characterCount, Math.max(duration, 1)))
      : 0;

  const accuracy =
    state.session.characterCount > 0
      ? Effect.runSync(calculateAccuracy(state.session.characterCount, state.session.errorCount))
      : 100;

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>typing</h1>
        <p>improve your words per minute</p>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">
            {state.isComplete ? wpm : state.session.isRunning ? wpm : "-"}
          </div>
          <div className="stat-label">wpm</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {state.session.isRunning || state.isComplete ? `${accuracy}%` : "-"}
          </div>
          <div className="stat-label">accuracy</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {state.currentWordIndex}/{state.words.length}
          </div>
          <div className="stat-label">words</div>
        </div>
      </div>

      <div className="mode-selector">
        <button
          className={`mode-btn ${state.mode === "all" ? "active" : ""}`}
          onClick={() => handleModeChange("all")}
        >
          all words
        </button>
        <button
          className={`mode-btn ${state.mode === "left" ? "active" : ""}`}
          onClick={() => handleModeChange("left")}
        >
          left hand
        </button>
        <button
          className={`mode-btn ${state.mode === "right" ? "active" : ""}`}
          onClick={() => handleModeChange("right")}
        >
          right hand
        </button>
      </div>

      <div className="typing-area" onClick={focusInput}>
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
        <WordDisplay
          words={state.words}
          currentWordIndex={state.currentWordIndex}
          currentCharIndex={state.currentCharIndex}
          typedChars={state.typedChars}
          showFingerHints={state.mode !== "all"}
        />
      </div>

      {state.isComplete && (
        <div className="results">
          <h2>Test Complete!</h2>
          <div className="results-stats">
            <div className="stat">
              <div className="stat-value">{wpm}</div>
              <div className="stat-label">wpm</div>
            </div>
            <div className="stat">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-value">{Math.round(duration / 1000)}s</div>
              <div className="stat-label">time</div>
            </div>
          </div>
          <button className="btn" onClick={handleRestart}>
            Try Again
          </button>
        </div>
      )}

      <div className="controls">
        <button className="btn btn-secondary" onClick={handleRestart}>
          Restart
        </button>
      </div>

      <Keyboard activeKey={currentChar} showFingerColors={true} mode={state.mode} />
      {state.mode !== "all" && <FingerLegend mode={state.mode} />}
    </div>
  );
}
