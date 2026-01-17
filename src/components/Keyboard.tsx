import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface KeyboardProps {
  activeKey?: string;
  showFingerColors?: boolean;
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

export function Keyboard({ activeKey, showFingerColors = true }: KeyboardProps) {
  const activeKeyLower = activeKey?.toLowerCase();

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const finger = getFingerForKey(key);
            const fingerClass = showFingerColors ? getFingerClass(finger) : "";
            const isActive = activeKeyLower === key;

            return (
              <div key={key} className={`key ${fingerClass} ${isActive ? "active" : ""}`}>
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

export function FingerLegend() {
  const fingers = [
    { name: "Pinky", color: "var(--finger-pinky)" },
    { name: "Ring", color: "var(--finger-ring)" },
    { name: "Middle", color: "var(--finger-middle)" },
    { name: "Index", color: "var(--finger-index)" },
    { name: "Thumb", color: "var(--finger-thumb)" },
  ];

  return (
    <div className="finger-legend">
      {fingers.map((finger) => (
        <div key={finger.name} className="legend-item">
          <div className="legend-color" style={{ backgroundColor: finger.color }} />
          <span>{finger.name}</span>
        </div>
      ))}
    </div>
  );
}
