import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, boolean>; // key: "wordIndex-charIndex", value: isCorrect
  showFingerHints?: boolean;
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

export function WordDisplay({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  showFingerHints = true,
}: WordDisplayProps) {
  return (
    <div className="words-display">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="word">
          {[...word].map((char, charIndex) => {
            const key = `${wordIndex}-${charIndex}`;
            const isCurrentWord = wordIndex === currentWordIndex;
            const isCurrentChar = isCurrentWord && charIndex === currentCharIndex;
            const isPast =
              wordIndex < currentWordIndex || (isCurrentWord && charIndex < currentCharIndex);
            const isTyped = typedChars.has(key);
            const isCorrect = typedChars.get(key);

            let statusClass = "pending";
            if (isTyped) {
              statusClass = isCorrect ? "correct" : "incorrect";
            }

            const finger = getFingerForKey(char);
            const fingerClass = showFingerHints && !isPast ? getFingerClass(finger) : "";

            return (
              <span
                key={charIndex}
                className={`letter ${statusClass} ${isCurrentChar ? "current" : ""} ${fingerClass}`}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span className="letter pending" style={{ width: "0.5em" }}>
              {" "}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
