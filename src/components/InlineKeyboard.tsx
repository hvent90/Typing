import React from "react";
import { Finger, getFingerForKey, getHandForKey, Hand } from "../core/keyboard/layout.ts";

type Mode = "left" | "right";

interface InlineKeyboardProps {
  activeKey?: string;
  mode: Mode;
}

// Left hand keys layout (reversed for natural hand position)
const LEFT_ROWS = [
  ["q", "w", "e", "r", "t"],
  ["a", "s", "d", "f", "g"],
  ["z", "x", "c", "v", "b"],
];

// Right hand keys layout
const RIGHT_ROWS = [
  ["y", "u", "i", "o", "p"],
  ["h", "j", "k", "l"],
  ["n", "m"],
];

function getFingerClass(finger: Finger | undefined): string {
  if (!finger) return "";
  switch (finger) {
    case Finger.LeftPinky:
    case Finger.RightPinky:
      return "finger-pinky";
    case Finger.LeftRing:
    case Finger.RightRing:
      return "finger-ring";
    case Finger.LeftMiddle:
    case Finger.RightMiddle:
      return "finger-middle";
    case Finger.LeftIndex:
    case Finger.RightIndex:
      return "finger-index";
    default:
      return "";
  }
}

export function InlineKeyboard({ activeKey, mode }: InlineKeyboardProps) {
  const activeKeyLower = activeKey?.toLowerCase();
  const rows = mode === "left" ? LEFT_ROWS : RIGHT_ROWS;

  return (
    <div className={`inline-keyboard inline-keyboard-${mode}`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="inline-keyboard-row">
          {row.map((key) => {
            const finger = getFingerForKey(key);
            const fingerClass = getFingerClass(finger);
            const isActive = activeKeyLower === key;

            return (
              <div
                key={key}
                className={`inline-key ${fingerClass} ${isActive ? "active" : ""}`}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
      <div className="inline-keyboard-row">
        <div className={`inline-key inline-spacebar ${activeKeyLower === " " ? "active" : ""}`}>
          space
        </div>
      </div>
    </div>
  );
}
