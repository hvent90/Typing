import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface NextKeyHintProps {
  char: string | undefined;
}

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

function getFingerName(finger: Finger | undefined): string {
  if (!finger) return "";
  switch (finger) {
    case Finger.LeftPinky:
    case Finger.RightPinky:
      return "pinky";
    case Finger.LeftRing:
    case Finger.RightRing:
      return "ring";
    case Finger.LeftMiddle:
    case Finger.RightMiddle:
      return "middle";
    case Finger.LeftIndex:
    case Finger.RightIndex:
      return "index";
    default:
      return "";
  }
}

export function NextKeyHint({ char }: NextKeyHintProps) {
  if (!char) return null;

  const finger = getFingerForKey(char);
  const fingerClass = getFingerClass(finger);
  const fingerName = getFingerName(finger);

  return (
    <div className="next-key-hint">
      <div className={`next-key-box ${fingerClass}`}>
        <span className="next-key-char">{char}</span>
      </div>
      {fingerName && <span className={`next-key-finger ${fingerClass}`}>{fingerName}</span>}
    </div>
  );
}
