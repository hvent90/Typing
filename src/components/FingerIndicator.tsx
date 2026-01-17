import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface FingerIndicatorProps {
  currentChar: string | undefined;
  mode: "left" | "right";
}

type FingerType = "pinky" | "ring" | "middle" | "index";

const LEFT_HAND_FINGERS: FingerType[] = ["pinky", "ring", "middle", "index"];
const RIGHT_HAND_FINGERS: FingerType[] = ["index", "middle", "ring", "pinky"];

const FINGER_LABELS: Record<FingerType, string> = {
  pinky: "Pinky",
  ring: "Ring",
  middle: "Middle",
  index: "Index",
};

function getFingerType(finger: Finger | undefined): FingerType | undefined {
  if (!finger) return undefined;
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
      return undefined;
  }
}

export function FingerIndicator({ currentChar, mode }: FingerIndicatorProps) {
  const fingers = mode === "left" ? LEFT_HAND_FINGERS : RIGHT_HAND_FINGERS;
  const currentFinger = currentChar ? getFingerForKey(currentChar) : undefined;
  const activeFingerType = getFingerType(currentFinger);

  return (
    <div className="finger-indicator">
      {fingers.map((fingerType) => {
        const isActive = fingerType === activeFingerType;
        return (
          <div
            key={fingerType}
            className={`finger-label finger-${fingerType} ${isActive ? "active" : "inactive"}`}
          >
            {FINGER_LABELS[fingerType]}
          </div>
        );
      })}
    </div>
  );
}
