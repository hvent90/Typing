import React from "react";
import { Finger, getFingerForKey } from "../core/keyboard/layout.ts";

interface WordDisplayProps {
  text: string; // Full text with spaces
  currentPosition: number; // Current position in text
  typedChars: Map<number, boolean>; // position -> isCorrect
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
  text,
  currentPosition,
  typedChars,
  showFingerHints = true,
  showInlineKeyHint = false,
}: WordDisplayProps) {
  // Split text into words for display grouping, but track positions globally
  const words = text.split(" ");

  // Calculate position offset for each word
  let positionOffset = 0;

  return (
    <div className="words-display">
      {words.map((word, wordIndex) => {
        const wordStartPos = positionOffset;
        // Calculate which word the current position is in
        const currentWordIndex = (() => {
          let offset = 0;
          for (let i = 0; i < words.length; i++) {
            const endOfWord = offset + words[i].length;
            if (currentPosition < endOfWord || (currentPosition === endOfWord && i === words.length - 1)) {
              return i;
            }
            offset = endOfWord + 1; // +1 for space
          }
          return words.length - 1;
        })();

        const fadeClass = getFadeClass(wordIndex, currentWordIndex);

        const wordContent = (
          <span key={wordIndex} className={`word ${fadeClass}`}>
            {[...word].map((char, charIndex) => {
              const pos = wordStartPos + charIndex;
              const isCurrentChar = pos === currentPosition;
              const isTyped = typedChars.has(pos);
              const isCorrect = typedChars.get(pos);

              let statusClass = "pending";
              if (isTyped) {
                statusClass = isCorrect ? "correct" : "incorrect";
              }

              const finger = getFingerForKey(char);
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
            {wordIndex < words.length - 1 && (() => {
              const spacePos = wordStartPos + word.length;
              const isCurrentChar = spacePos === currentPosition;
              const isTyped = typedChars.has(spacePos);
              const isCorrect = typedChars.get(spacePos);

              let statusClass = "pending";
              if (isTyped) {
                statusClass = isCorrect ? "correct" : "incorrect";
              }

              return (
                <span
                  className={`letter space ${statusClass} ${isCurrentChar ? "current" : ""}`}
                  style={{ width: "0.5em" }}
                >
                  {" "}
                </span>
              );
            })()}
          </span>
        );

        // Update offset for next word (word length + 1 for space)
        positionOffset += word.length + (wordIndex < words.length - 1 ? 1 : 0);

        return wordContent;
      })}
    </div>
  );
}
