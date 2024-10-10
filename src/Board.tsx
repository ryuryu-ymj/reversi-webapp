import { motion } from "framer-motion";
import "./App.css";
import { BOARD_DIM, DiscType, SquareType } from "./game-logic";

/**
 * 碁盤の上に置く石を描画するコンポーネント.
 */
export function Disc(
  { value }: {
    value: DiscType;
  },
) {
  return (
    <motion.div
      className="disc"
      animate={{ rotateY: value === "Black" ? 0 : 180 }}
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
  { value, onSquareClick }: {
    value: SquareType;
    onSquareClick: () => void;
  },
) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value !== "None" ? <Disc value={value} /> : null}
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
  const grid = value.map((row, i) => {
    const rowJSX = row.map((cell, j) => (
      <Square
        key={i * BOARD_DIM + j}
        value={cell}
        onSquareClick={() => {
          onSquareClick(i, j);
        }}
      />
    ));

    return <div className="board-row" key={i}>{rowJSX}</div>;
  });

  return <div className="board">{grid}</div>;
}
