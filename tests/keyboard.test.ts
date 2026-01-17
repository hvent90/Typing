import { describe, expect, test } from "bun:test";
import {
  Finger,
  Hand,
  getFingerForKey,
  getHandForKey,
  getKeysForHand,
  FINGER_COLORS,
} from "../src/core/keyboard/layout.ts";

describe("Keyboard Layout", () => {
  describe("getHandForKey", () => {
    test("left hand keys", () => {
      const leftHandKeys = [
        "q",
        "w",
        "e",
        "r",
        "t",
        "a",
        "s",
        "d",
        "f",
        "g",
        "z",
        "x",
        "c",
        "v",
        "b",
      ];
      for (const key of leftHandKeys) {
        expect(getHandForKey(key)).toBe(Hand.Left);
      }
    });

    test("right hand keys", () => {
      const rightHandKeys = ["y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m"];
      for (const key of rightHandKeys) {
        expect(getHandForKey(key)).toBe(Hand.Right);
      }
    });

    test("handles uppercase keys", () => {
      expect(getHandForKey("Q")).toBe(Hand.Left);
      expect(getHandForKey("P")).toBe(Hand.Right);
    });

    test("returns undefined for non-letter keys", () => {
      expect(getHandForKey(" ")).toBeUndefined();
      expect(getHandForKey("1")).toBeUndefined();
    });
  });

  describe("getFingerForKey", () => {
    test("left pinky keys", () => {
      expect(getFingerForKey("q")).toBe(Finger.LeftPinky);
      expect(getFingerForKey("a")).toBe(Finger.LeftPinky);
      expect(getFingerForKey("z")).toBe(Finger.LeftPinky);
    });

    test("left ring keys", () => {
      expect(getFingerForKey("w")).toBe(Finger.LeftRing);
      expect(getFingerForKey("s")).toBe(Finger.LeftRing);
      expect(getFingerForKey("x")).toBe(Finger.LeftRing);
    });

    test("left middle keys", () => {
      expect(getFingerForKey("e")).toBe(Finger.LeftMiddle);
      expect(getFingerForKey("d")).toBe(Finger.LeftMiddle);
      expect(getFingerForKey("c")).toBe(Finger.LeftMiddle);
    });

    test("left index keys", () => {
      expect(getFingerForKey("r")).toBe(Finger.LeftIndex);
      expect(getFingerForKey("t")).toBe(Finger.LeftIndex);
      expect(getFingerForKey("f")).toBe(Finger.LeftIndex);
      expect(getFingerForKey("g")).toBe(Finger.LeftIndex);
      expect(getFingerForKey("v")).toBe(Finger.LeftIndex);
      expect(getFingerForKey("b")).toBe(Finger.LeftIndex);
    });

    test("right index keys", () => {
      expect(getFingerForKey("y")).toBe(Finger.RightIndex);
      expect(getFingerForKey("u")).toBe(Finger.RightIndex);
      expect(getFingerForKey("h")).toBe(Finger.RightIndex);
      expect(getFingerForKey("j")).toBe(Finger.RightIndex);
      expect(getFingerForKey("n")).toBe(Finger.RightIndex);
      expect(getFingerForKey("m")).toBe(Finger.RightIndex);
    });

    test("right middle keys", () => {
      expect(getFingerForKey("i")).toBe(Finger.RightMiddle);
      expect(getFingerForKey("k")).toBe(Finger.RightMiddle);
    });

    test("right ring keys", () => {
      expect(getFingerForKey("o")).toBe(Finger.RightRing);
      expect(getFingerForKey("l")).toBe(Finger.RightRing);
    });

    test("right pinky keys", () => {
      expect(getFingerForKey("p")).toBe(Finger.RightPinky);
    });

    test("handles uppercase", () => {
      expect(getFingerForKey("Q")).toBe(Finger.LeftPinky);
    });
  });

  describe("getKeysForHand", () => {
    test("left hand has 15 letter keys", () => {
      const leftKeys = getKeysForHand(Hand.Left);
      expect(leftKeys).toContain("q");
      expect(leftKeys).toContain("a");
      expect(leftKeys).toContain("z");
      expect(leftKeys).not.toContain("p");
      expect(leftKeys).not.toContain("l");
    });

    test("right hand has 11 letter keys", () => {
      const rightKeys = getKeysForHand(Hand.Right);
      expect(rightKeys).toContain("p");
      expect(rightKeys).toContain("l");
      expect(rightKeys).not.toContain("q");
      expect(rightKeys).not.toContain("a");
    });
  });

  describe("FINGER_COLORS", () => {
    test("has colors for all fingers", () => {
      expect(FINGER_COLORS[Finger.LeftPinky]).toBe("#ef4444");
      expect(FINGER_COLORS[Finger.LeftRing]).toBe("#f97316");
      expect(FINGER_COLORS[Finger.LeftMiddle]).toBe("#eab308");
      expect(FINGER_COLORS[Finger.LeftIndex]).toBe("#22c55e");
      expect(FINGER_COLORS[Finger.RightIndex]).toBe("#22c55e");
      expect(FINGER_COLORS[Finger.RightMiddle]).toBe("#eab308");
      expect(FINGER_COLORS[Finger.RightRing]).toBe("#f97316");
      expect(FINGER_COLORS[Finger.RightPinky]).toBe("#ef4444");
    });
  });
});
