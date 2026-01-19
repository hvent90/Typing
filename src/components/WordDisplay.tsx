import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface WordDisplayProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, boolean>; // key: "wordIndex-charIndex", value: isCorrect
  showFingerHints?: boolean;
  showInlineKeyHint?: boolean;
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

// Get progressive fade class based on distance from current word
function getFadeClass(wordIndex: number, currentWordIndex: number): string {
  const distance = wordIndex - currentWordIndex;
  if (distance <= 0) return wordIndex < currentWordIndex ? "typed" : "";
  if (distance === 1) return "fade-1";
  if (distance === 2) return "fade-2";
  if (distance === 3) return "fade-3";
  if (distance >= 4) return "fade-4";
  return "";
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

export function WordDisplay({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  showFingerHints = true,
  showInlineKeyHint = false,
}: WordDisplayProps) {
  return (
    <div className="words-display">
      {words.map((word, wordIndex) => {
        const fadeClass = getFadeClass(wordIndex, currentWordIndex);
        const isCurrentWord = wordIndex === currentWordIndex;

        return (
          <span key={wordIndex} className={`word ${fadeClass}`}>
            {[...word].map((char, charIndex) => {
              const key = `${wordIndex}-${charIndex}`;
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
              // Only show finger colors on untyped (pending) letters
              const fingerClass = showFingerHints && !isTyped ? getFingerClass(finger) : "";
              const fingerName = getFingerName(finger);

              return (
                <span
                  key={charIndex}
                  className={`letter ${statusClass} ${isCurrentChar ? "current" : ""} ${fingerClass}`}
                >
                  {char}
                  {showInlineKeyHint && isCurrentChar && (
                    <span className={`inline-key-hint ${fingerClass}`}>
                      <span className="inline-key-box">{char}</span>
                      {fingerName && <span className="inline-key-finger">{fingerName}</span>}
                    </span>
                  )}
                </span>
              );
            })}
            {wordIndex < words.length - 1 && (
              <span className="letter pending" style={{ width: "0.3em" }}>
                {" "}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
