import { describe, expect, test } from "bun:test";
import { Effect, Exit } from "effect";
import {
  calculateWPM,
  calculateAccuracy,
  TimingSession,
  TimingError,
} from "../src/core/timing/wpm.ts";

describe("WPM Timing", () => {
  describe("calculateWPM", () => {
    test("calculates correct WPM for standard typing", () => {
      // 50 characters in 60 seconds = 10 WPM (50/5 words / 1 minute)
      const result = Effect.runSync(calculateWPM(50, 60000));
      expect(result).toBe(10);
    });

    test("calculates WPM for faster typing", () => {
      // 250 characters in 60 seconds = 50 WPM
      const result = Effect.runSync(calculateWPM(250, 60000));
      expect(result).toBe(50);
    });

    test("handles very fast typing", () => {
      // 500 characters in 60 seconds = 100 WPM
      const result = Effect.runSync(calculateWPM(500, 60000));
      expect(result).toBe(100);
    });

    test("handles short durations", () => {
      // 25 characters in 30 seconds = 10 WPM
      const result = Effect.runSync(calculateWPM(25, 30000));
      expect(result).toBe(10);
    });

    test("fails for zero duration", () => {
      const result = Effect.runSyncExit(calculateWPM(50, 0));
      expect(Exit.isFailure(result)).toBe(true);
    });

    test("fails for negative duration", () => {
      const result = Effect.runSyncExit(calculateWPM(50, -1000));
      expect(Exit.isFailure(result)).toBe(true);
    });

    test("returns 0 for zero characters", () => {
      const result = Effect.runSync(calculateWPM(0, 60000));
      expect(result).toBe(0);
    });
  });

  describe("calculateAccuracy", () => {
    test("returns 100 for perfect accuracy", () => {
      const result = Effect.runSync(calculateAccuracy(100, 0));
      expect(result).toBe(100);
    });

    test("calculates accuracy with errors", () => {
      const result = Effect.runSync(calculateAccuracy(100, 10));
      expect(result).toBe(90);
    });

    test("handles all errors", () => {
      const result = Effect.runSync(calculateAccuracy(10, 10));
      expect(result).toBe(0);
    });

    test("clamps negative values to 0", () => {
      const result = Effect.runSync(calculateAccuracy(10, 20));
      expect(result).toBe(0);
    });

    test("fails for zero total characters", () => {
      const result = Effect.runSyncExit(calculateAccuracy(0, 0));
      expect(Exit.isFailure(result)).toBe(true);
    });
  });

  describe("TimingSession", () => {
    test("creates a new session", () => {
      const session = TimingSession.create();
      expect(session.isRunning).toBe(false);
      expect(session.startTime).toBeUndefined();
    });

    test("starts a session", () => {
      const session = TimingSession.create().start();
      expect(session.isRunning).toBe(true);
      expect(session.startTime).toBeDefined();
    });

    test("stops a session", () => {
      const session = TimingSession.create().start().stop();
      expect(session.isRunning).toBe(false);
      expect(session.endTime).toBeDefined();
    });

    test("calculates duration", () => {
      const session = TimingSession.create();
      const started = session.start();
      // Simulate passage of time by manually setting endTime
      const ended = {
        ...started,
        isRunning: false,
        endTime: (started.startTime ?? 0) + 1000,
      };
      const duration = TimingSession.getDuration(ended);
      expect(duration).toBe(1000);
    });

    test("returns 0 duration for incomplete session", () => {
      const session = TimingSession.create();
      const duration = TimingSession.getDuration(session);
      expect(duration).toBe(0);
    });
  });
});
