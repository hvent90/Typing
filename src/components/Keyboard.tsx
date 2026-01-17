import React from "react";
import { Finger, getFingerForKey, getHandForKey, Hand } from "../core/keyboard/layout.ts";

type Mode = "all" | "left" | "right";

interface KeyboardProps {
  activeKey?: string;
  showFingerColors?: boolean;
  mode?: Mode;
}

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
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

export function Keyboard({ activeKey, showFingerColors = true, mode = "all" }: KeyboardProps) {
  const activeKeyLower = activeKey?.toLowerCase();

  const isKeyDisabled = (key: string): boolean => {
    if (mode === "all") return false;
    const keyHand = getHandForKey(key);
    if (mode === "left") return keyHand !== Hand.Left;
    if (mode === "right") return keyHand !== Hand.Right;
    return false;
  };

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const finger = getFingerForKey(key);
            const fingerClass = showFingerColors ? getFingerClass(finger) : "";
            const isActive = activeKeyLower === key;
            const isDisabled = isKeyDisabled(key);

            return (
              <div
                key={key}
                className={`key ${fingerClass} ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
      <div className="keyboard-row">
        <div className="key spacebar">space</div>
      </div>
    </div>
  );
}

interface FingerLegendProps {
  mode?: Mode;
}

export function FingerLegend({ mode = "all" }: FingerLegendProps) {
  // Finger order matches left-to-right on keyboard for each hand
  const leftHandFingers = [
    { name: "Pinky", color: "var(--finger-pinky)" },
    { name: "Ring", color: "var(--finger-ring)" },
    { name: "Middle", color: "var(--finger-middle)" },
    { name: "Index", color: "var(--finger-index)" },
  ];

  const rightHandFingers = [
    { name: "Index", color: "var(--finger-index)" },
    { name: "Middle", color: "var(--finger-middle)" },
    { name: "Ring", color: "var(--finger-ring)" },
    { name: "Pinky", color: "var(--finger-pinky)" },
  ];

  const fingers = mode === "right" ? rightHandFingers : leftHandFingers;

  return (
    <div className="finger-legend">
      {fingers.map((finger, index) => (
        <div key={`${finger.name}-${index}`} className="legend-item">
          <div className="legend-color" style={{ backgroundColor: finger.color }} />
          <span>{finger.name}</span>
        </div>
      ))}
    </div>
  );
}
