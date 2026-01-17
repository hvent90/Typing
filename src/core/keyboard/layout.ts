export enum Hand {
  Left = "left",
  Right = "right",
}

export enum Finger {
  LeftPinky = "leftPinky",
  LeftRing = "leftRing",
  LeftMiddle = "leftMiddle",
  LeftIndex = "leftIndex",
  RightIndex = "rightIndex",
  RightMiddle = "rightMiddle",
  RightRing = "rightRing",
  RightPinky = "rightPinky",
  Thumb = "thumb",
}

export const FINGER_COLORS: Record<Finger, string> = {
  [Finger.LeftPinky]: "#ef4444",
  [Finger.LeftRing]: "#3b82f6",
  [Finger.LeftMiddle]: "#eab308",
  [Finger.LeftIndex]: "#22c55e",
  [Finger.RightIndex]: "#22c55e",
  [Finger.RightMiddle]: "#eab308",
  [Finger.RightRing]: "#3b82f6",
  [Finger.RightPinky]: "#ef4444",
  [Finger.Thumb]: "#a855f7",
};

const KEY_TO_FINGER: Record<string, Finger> = {
  // Left pinky
  q: Finger.LeftPinky,
  a: Finger.LeftPinky,
  z: Finger.LeftPinky,
  // Left ring
  w: Finger.LeftRing,
  s: Finger.LeftRing,
  x: Finger.LeftRing,
  // Left middle
  e: Finger.LeftMiddle,
  d: Finger.LeftMiddle,
  c: Finger.LeftMiddle,
  // Left index
  r: Finger.LeftIndex,
  t: Finger.LeftIndex,
  f: Finger.LeftIndex,
  g: Finger.LeftIndex,
  v: Finger.LeftIndex,
  b: Finger.LeftIndex,
  // Right index
  y: Finger.RightIndex,
  u: Finger.RightIndex,
  h: Finger.RightIndex,
  j: Finger.RightIndex,
  n: Finger.RightIndex,
  m: Finger.RightIndex,
  // Right middle
  i: Finger.RightMiddle,
  k: Finger.RightMiddle,
  // Right ring
  o: Finger.RightRing,
  l: Finger.RightRing,
  // Right pinky
  p: Finger.RightPinky,
};

const LEFT_HAND_KEYS = new Set([
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
]);

const RIGHT_HAND_KEYS = new Set(["y", "u", "i", "o", "p", "h", "j", "k", "l", "n", "m"]);

export function getHandForKey(key: string): Hand | undefined {
  const lowerKey = key.toLowerCase();
  if (LEFT_HAND_KEYS.has(lowerKey)) return Hand.Left;
  if (RIGHT_HAND_KEYS.has(lowerKey)) return Hand.Right;
  return undefined;
}

export function getFingerForKey(key: string): Finger | undefined {
  return KEY_TO_FINGER[key.toLowerCase()];
}

export function getKeysForHand(hand: Hand): string[] {
  return hand === Hand.Left ? [...LEFT_HAND_KEYS] : [...RIGHT_HAND_KEYS];
}

export interface KeyLayout {
  key: string;
  finger: Finger;
  hand: Hand;
  row: number;
  col: number;
}

export const KEYBOARD_LAYOUT: KeyLayout[] = [
  // Top row
  { key: "q", finger: Finger.LeftPinky, hand: Hand.Left, row: 0, col: 0 },
  { key: "w", finger: Finger.LeftRing, hand: Hand.Left, row: 0, col: 1 },
  { key: "e", finger: Finger.LeftMiddle, hand: Hand.Left, row: 0, col: 2 },
  { key: "r", finger: Finger.LeftIndex, hand: Hand.Left, row: 0, col: 3 },
  { key: "t", finger: Finger.LeftIndex, hand: Hand.Left, row: 0, col: 4 },
  { key: "y", finger: Finger.RightIndex, hand: Hand.Right, row: 0, col: 5 },
  { key: "u", finger: Finger.RightIndex, hand: Hand.Right, row: 0, col: 6 },
  { key: "i", finger: Finger.RightMiddle, hand: Hand.Right, row: 0, col: 7 },
  { key: "o", finger: Finger.RightRing, hand: Hand.Right, row: 0, col: 8 },
  { key: "p", finger: Finger.RightPinky, hand: Hand.Right, row: 0, col: 9 },
  // Home row
  { key: "a", finger: Finger.LeftPinky, hand: Hand.Left, row: 1, col: 0 },
  { key: "s", finger: Finger.LeftRing, hand: Hand.Left, row: 1, col: 1 },
  { key: "d", finger: Finger.LeftMiddle, hand: Hand.Left, row: 1, col: 2 },
  { key: "f", finger: Finger.LeftIndex, hand: Hand.Left, row: 1, col: 3 },
  { key: "g", finger: Finger.LeftIndex, hand: Hand.Left, row: 1, col: 4 },
  { key: "h", finger: Finger.RightIndex, hand: Hand.Right, row: 1, col: 5 },
  { key: "j", finger: Finger.RightIndex, hand: Hand.Right, row: 1, col: 6 },
  { key: "k", finger: Finger.RightMiddle, hand: Hand.Right, row: 1, col: 7 },
  { key: "l", finger: Finger.RightRing, hand: Hand.Right, row: 1, col: 8 },
  // Bottom row
  { key: "z", finger: Finger.LeftPinky, hand: Hand.Left, row: 2, col: 0 },
  { key: "x", finger: Finger.LeftRing, hand: Hand.Left, row: 2, col: 1 },
  { key: "c", finger: Finger.LeftMiddle, hand: Hand.Left, row: 2, col: 2 },
  { key: "v", finger: Finger.LeftIndex, hand: Hand.Left, row: 2, col: 3 },
  { key: "b", finger: Finger.LeftIndex, hand: Hand.Left, row: 2, col: 4 },
  { key: "n", finger: Finger.RightIndex, hand: Hand.Right, row: 2, col: 5 },
  { key: "m", finger: Finger.RightIndex, hand: Hand.Right, row: 2, col: 6 },
];
