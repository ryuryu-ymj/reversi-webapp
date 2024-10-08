import { motion } from "framer-motion";
import { useRef } from "react";

import "./App.css";
import { BOARD_DIM, DiscType, SquareType } from "./game-logic";

/**
 * 碁盤の上に置く石を描画するコンポーネント.
 */
export function Disc(
  { value, onAnimationStart, onAnimationComplete }: {
    value: DiscType;
    onAnimationStart?: () => void;
    onAnimationComplete?: () => void;
  },
) {
  return (
    <motion.div
      className="disc"
      animate={{ rotateY: value === "Black" ? 0 : 180 }}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
    >
      <div className="face-black" />
      <div className="face-white" />
    </motion.div>
  );
}

/**
 * 各碁盤の目を表示するコンポーネント.
 */
function Square(
  { value, onSquareClick, onAnimationStart, onAnimationComplete }: {
    value: SquareType;
    onSquareClick: () => void;
    onAnimationStart: () => void;
    onAnimationComplete: () => void;
  },
) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value !== "None"
        ? (
          <Disc
            value={value}
            onAnimationStart={onAnimationStart}
            onAnimationComplete={onAnimationComplete}
          />
        )
        : null}
    </button>
  );
}

/**
 * 碁盤を表示するコンポーネント.
 */
export function Board(
  { value, onSquareClick }: {
    value: SquareType[][];
    onSquareClick: (i: number, j: number) => void;
  },
) {
  const runningAnimations = useRef(0);
  function handleAnimationStart() {
    runningAnimations.current += 1;
  }
  function handleAnimationCompleted() {
    runningAnimations.current -= 1;
  }

  const grid = value.map((row, i) => {
    const rowJSX = row.map((cell, j) => (
      <Square
        key={i * BOARD_DIM + j}
        value={cell}
        onSquareClick={() => {
          if (runningAnimations.current === 0) {
            onSquareClick(i, j);
          }
        }}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationCompleted}
      />
    ));

    return <div className="board-row" key={i}>{rowJSX}</div>;
  });

  return <div className="board">{grid}</div>;
}
