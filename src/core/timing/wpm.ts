import { Effect, Data } from "effect";

// Errors
export class TimingError extends Data.TaggedError("TimingError")<{
  readonly message: string;
}> {}

// Standard: 5 characters = 1 word
const CHARS_PER_WORD = 5;

/**
 * Calculate words per minute
 * @param characterCount - Number of characters typed
 * @param durationMs - Duration in milliseconds
 * @returns WPM as an Effect
 */
export function calculateWPM(
  characterCount: number,
  durationMs: number,
): Effect.Effect<number, TimingError> {
  return Effect.gen(function* () {
    if (durationMs <= 0) {
      return yield* Effect.fail(new TimingError({ message: "Duration must be positive" }));
    }

    if (characterCount === 0) {
      return 0;
    }

    const words = characterCount / CHARS_PER_WORD;
    const minutes = durationMs / 60000;
    return Math.round(words / minutes);
  });
}

/**
 * Calculate typing accuracy
 * @param totalCharacters - Total characters typed
 * @param errorCount - Number of errors
 * @returns Accuracy percentage as an Effect
 */
export function calculateAccuracy(
  totalCharacters: number,
  errorCount: number,
): Effect.Effect<number, TimingError> {
  return Effect.gen(function* () {
    if (totalCharacters === 0) {
      return yield* Effect.fail(new TimingError({ message: "Total characters must be positive" }));
    }

    const accuracy = ((totalCharacters - errorCount) / totalCharacters) * 100;
    return Math.max(0, Math.round(accuracy));
  });
}

// Timing session state
export interface TimingSessionState {
  readonly isRunning: boolean;
  readonly startTime?: number;
  readonly endTime?: number;
  readonly characterCount: number;
  readonly errorCount: number;
}

export const TimingSession = {
  create(): TimingSessionState {
    return {
      isRunning: false,
      startTime: undefined,
      endTime: undefined,
      characterCount: 0,
      errorCount: 0,
    };
  },

  start(session: TimingSessionState = TimingSession.create()): TimingSessionState {
    return {
      ...session,
      isRunning: true,
      startTime: Date.now(),
      endTime: undefined,
    };
  },

  stop(session: TimingSessionState): TimingSessionState {
    return {
      ...session,
      isRunning: false,
      endTime: Date.now(),
    };
  },

  getDuration(session: TimingSessionState): number {
    if (session.startTime === undefined) return 0;
    const endTime = session.endTime ?? Date.now();
    return endTime - session.startTime;
  },

  addCharacter(session: TimingSessionState, isCorrect: boolean): TimingSessionState {
    return {
      ...session,
      characterCount: session.characterCount + 1,
      errorCount: session.errorCount + (isCorrect ? 0 : 1),
    };
  },

  reset(): TimingSessionState {
    return TimingSession.create();
  },
};

// Make start chainable on session
Object.defineProperty(Object.prototype, "start", {
  value: function (this: TimingSessionState) {
    if ("isRunning" in this) {
      return TimingSession.start(this);
    }
    return this;
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(Object.prototype, "stop", {
  value: function (this: TimingSessionState) {
    if ("isRunning" in this) {
      return TimingSession.stop(this);
    }
    return this;
  },
  writable: true,
  configurable: true,
});

// Augment the interface with chainable methods
declare global {
  interface Object {
    start(): TimingSessionState;
    stop(): TimingSessionState;
  }
}
