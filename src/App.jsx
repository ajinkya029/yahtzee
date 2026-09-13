import { useState } from "react";
import Die from "./Die";
import {
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
  ALL_CATEGORY_IDS,
  calculateScore,
  computeTotals,
  isYahtzee,
} from "./scoring";
import "./App.css";

const ROLLS_PER_TURN = 3;
const NUM_DICE = 5;

function randomFace() {
  return 1 + Math.floor(Math.random() * 6);
}

function freshTurnState() {
  return {
    dice: Array(NUM_DICE).fill(1),
    held: Array(NUM_DICE).fill(false),
    rollsLeft: ROLLS_PER_TURN,
    hasRolled: false,
  };
}

export default function App() {
  const [turn, setTurn] = useState(freshTurnState());
  const [scores, setScores] = useState({});
  const [rolling, setRolling] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [message, setMessage] = useState("Roll the dice to begin your turn.");

  const filledCount = ALL_CATEGORY_IDS.filter((id) => scores[id] != null).length;
  const gameOver = filledCount === ALL_CATEGORY_IDS.length;
  const { upperSum, upperBonus, lowerSum, yahtzeeBonus, grandTotal } =
    computeTotals(scores);

  function handleRoll() {
    if (turn.rollsLeft === 0 || gameOver) return;
    setRolling(true);
    const nextDice = turn.dice.map((d, i) => (turn.held[i] ? d : randomFace()));

    window.setTimeout(() => {
      const rolledYahtzee = isYahtzee(nextDice);
      const alreadyScoredYahtzee = scores.yahtzee === 50;
      let bonusMsg = "";
      if (rolledYahtzee && alreadyScoredYahtzee && turn.hasRolled) {
        setScores((s) => ({
          ...s,
          yahtzeeBonusCount: (s.yahtzeeBonusCount ?? 0) + 1,
        }));
        bonusMsg = " Another Yahtzee — bonus 100 points!";
      }
      setTurn((t) => ({
        ...t,
        dice: nextDice,
        rollsLeft: t.rollsLeft - 1,
        hasRolled: true,
      }));
      setRolling(false);
      setMessage(
        (rolledYahtzee
          ? "Yahtzee! Five of a kind."
          : `Rolls left: ${turn.rollsLeft - 1}.`) + bonusMsg
      );
    }, 420);
  }

  function toggleHold(i) {
    if (!turn.hasRolled || turn.rollsLeft === 0 || gameOver) return;
    setTurn((t) => ({
      ...t,
      held: t.held.map((h, idx) => (idx === i ? !h : h)),
    }));
  }

  function commitScore(categoryId) {
    if (!turn.hasRolled || scores[categoryId] != null || gameOver) return;
    const value = calculateScore(categoryId, turn.dice);
    setScores((s) => ({ ...s, [categoryId]: value }));
    setTurn(freshTurnState());
    setTurnCount((c) => c + 1);
    setMessage(
      filledCount + 1 === ALL_CATEGORY_IDS.length
        ? "That was the last category — game over!"
        : "Scored! Roll again for your next turn."
    );
  }

  function newGame() {
    setScores({});
    setTurn(freshTurnState());
    setTurnCount(1);
    setMessage("New game. Roll the dice to begin your turn.");
  }

  const canRoll = turn.rollsLeft > 0 && !gameOver;
  const canScore = turn.hasRolled && !gameOver;

  return (
    <div className="table">
      <header className="masthead">
        <h1>Yahtzee</h1>
        <p className="masthead__subtitle">
          {gameOver ? "Final score" : `Turn ${turnCount} of 13`}
        </p>
      </header>

      <main className="board">
        <section className="tray" aria-label="Dice tray">
          <div className="dice-row">
            {turn.dice.map((value, i) => (
              <Die
                key={i}
                index={i}
                value={value}
                held={turn.held[i]}
                disabled={!turn.hasRolled || turn.rollsLeft === 0 || gameOver}
                rolling={rolling && !turn.held[i]}
                onToggle={() => toggleHold(i)}
              />
            ))}
          </div>

          <div className="tray__controls">
            <button
              type="button"
              className="roll-button"
              onClick={handleRoll}
              disabled={!canRoll}
            >
              {turn.hasRolled ? "Roll again" : "Roll dice"}
              <span className="roll-button__rolls">
                {turn.rollsLeft} {turn.rollsLeft === 1 ? "roll" : "rolls"} left
              </span>
            </button>
            <p className="message" role="status">
              {gameOver
                ? `You scored ${grandTotal} points across 13 turns.`
                : message}
            </p>
          </div>
        </section>

        <section className="scorecard" aria-label="Scorecard">
          <div className="scorecard__section">
            <h2>Upper section</h2>
            <ul className="score-list">
              {UPPER_CATEGORIES.map((cat) => (
                <ScoreRow
                  key={cat.id}
                  cat={cat}
                  scores={scores}
                  dice={turn.dice}
                  canScore={canScore}
                  onCommit={commitScore}
                />
              ))}
            </ul>
            <div className="score-subtotal">
              <span>Subtotal</span>
              <span>{upperSum}</span>
            </div>
            <div className="score-subtotal score-subtotal--muted">
              <span>Bonus (63+ earns 35)</span>
              <span>{upperBonus}</span>
            </div>
          </div>

          <div className="scorecard__section">
            <h2>Lower section</h2>
            <ul className="score-list">
              {LOWER_CATEGORIES.map((cat) => (
                <ScoreRow
                  key={cat.id}
                  cat={cat}
                  scores={scores}
                  dice={turn.dice}
                  canScore={canScore}
                  onCommit={commitScore}
                />
              ))}
            </ul>
            <div className="score-subtotal">
              <span>Subtotal</span>
              <span>{lowerSum}</span>
            </div>
            {yahtzeeBonus > 0 && (
              <div className="score-subtotal score-subtotal--muted">
                <span>Yahtzee bonus</span>
                <span>{yahtzeeBonus}</span>
              </div>
            )}
          </div>

          <div className="score-grand-total">
            <span>Grand total</span>
            <span>{grandTotal}</span>
          </div>
        </section>
      </main>

      {gameOver && (
        <div className="game-over-banner">
          <p>Game over — final score {grandTotal}.</p>
          <button type="button" onClick={newGame}>
            Play again
          </button>
        </div>
      )}

      {!gameOver && filledCount > 0 && (
        <button type="button" className="restart-link" onClick={newGame}>
          Start over
        </button>
      )}
    </div>
  );
}

function ScoreRow({ cat, scores, dice, canScore, onCommit }) {
  const filled = scores[cat.id] != null;
  const preview = canScore && !filled ? calculateScore(cat.id, dice) : null;

  return (
    <li className={`score-row${filled ? " score-row--filled" : ""}`}>
      <button
        type="button"
        className="score-row__button"
        disabled={filled || !canScore}
        onClick={() => onCommit(cat.id)}
      >
        <span className="score-row__label">
          {cat.label}
          <span className="score-row__hint">{cat.hint}</span>
        </span>
        <span className="score-row__value">
          {filled ? scores[cat.id] : preview != null ? preview : "–"}
        </span>
      </button>
    </li>
  );
}
