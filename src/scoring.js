// Core Yahtzee scoring logic — pure functions, no React here.

export const UPPER_CATEGORIES = [
  { id: "ones", label: "Ones", hint: "Sum of all 1s" },
  { id: "twos", label: "Twos", hint: "Sum of all 2s" },
  { id: "threes", label: "Threes", hint: "Sum of all 3s" },
  { id: "fours", label: "Fours", hint: "Sum of all 4s" },
  { id: "fives", label: "Fives", hint: "Sum of all 5s" },
  { id: "sixes", label: "Sixes", hint: "Sum of all 6s" },
];

export const LOWER_CATEGORIES = [
  { id: "threeKind", label: "3 of a Kind", hint: "Sum of all dice" },
  { id: "fourKind", label: "4 of a Kind", hint: "Sum of all dice" },
  { id: "fullHouse", label: "Full House", hint: "25 points" },
  { id: "smallStraight", label: "Small Straight", hint: "30 points" },
  { id: "largeStraight", label: "Large Straight", hint: "40 points" },
  { id: "yahtzee", label: "Yahtzee", hint: "50 points" },
  { id: "chance", label: "Chance", hint: "Sum of all dice" },
];

export const ALL_CATEGORY_IDS = [
  ...UPPER_CATEGORIES.map((c) => c.id),
  ...LOWER_CATEGORIES.map((c) => c.id),
];

const UPPER_NUMBER = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};

function getCounts(dice) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach((d) => counts[d]++);
  return counts;
}

function sum(dice) {
  return dice.reduce((a, b) => a + b, 0);
}

function hasStraight(counts, length) {
  // Look for `length` consecutive face values each present at least once.
  const present = Object.keys(counts)
    .filter((face) => counts[face] > 0)
    .map(Number)
    .sort((a, b) => a - b);
  let run = 1;
  let best = present.length ? 1 : 0;
  for (let i = 1; i < present.length; i++) {
    if (present[i] === present[i - 1] + 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best >= length;
}

export function calculateScore(categoryId, dice) {
  if (!dice || dice.length !== 5) return 0;
  const counts = getCounts(dice);
  const total = sum(dice);

  if (UPPER_NUMBER[categoryId]) {
    const face = UPPER_NUMBER[categoryId];
    return counts[face] * face;
  }

  switch (categoryId) {
    case "threeKind":
      return Object.values(counts).some((c) => c >= 3) ? total : 0;
    case "fourKind":
      return Object.values(counts).some((c) => c >= 4) ? total : 0;
    case "fullHouse": {
      const values = Object.values(counts);
      const hasThree = values.includes(3);
      const hasTwo = values.includes(2);
      const hasFive = values.includes(5);
      return (hasThree && hasTwo) || hasFive ? 25 : 0;
    }
    case "smallStraight":
      return hasStraight(counts, 4) ? 30 : 0;
    case "largeStraight":
      return hasStraight(counts, 5) ? 40 : 0;
    case "yahtzee":
      return Object.values(counts).some((c) => c === 5) ? 50 : 0;
    case "chance":
      return total;
    default:
      return 0;
  }
}

export function isYahtzee(dice) {
  if (!dice || dice.length !== 5) return false;
  const counts = getCounts(dice);
  return Object.values(counts).some((c) => c === 5);
}

export function computeTotals(scores) {
  const upperSum = UPPER_CATEGORIES.reduce(
    (acc, c) => acc + (scores[c.id] ?? 0),
    0
  );
  const upperBonus = upperSum >= 63 ? 35 : 0;
  const lowerSum = LOWER_CATEGORIES.reduce(
    (acc, c) => acc + (scores[c.id] ?? 0),
    0
  );
  const yahtzeeBonus = (scores.yahtzeeBonusCount ?? 0) * 100;
  const grandTotal = upperSum + upperBonus + lowerSum + yahtzeeBonus;
  return { upperSum, upperBonus, lowerSum, yahtzeeBonus, grandTotal };
}
