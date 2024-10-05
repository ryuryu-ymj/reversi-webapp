import "./App.css";
import {
  BOARD_DIM,
  countDiscs,
  DISC_TYPE_HUMAN,
  DiscType,
  SquareType,
  useGameState,
} from "./game-logic";

/**
 * 碁盤の上に置く石を描画するコンポーネント.
 */
function Disc({ value }: { value: DiscType }) {
  switch (value) {
    case "Black":
      return <div className="disc Black"></div>;
    case "White":
      return <div className="disc White"></div>;
  }
}

/**
 * 各碁盤の目を表示するコンポーネント.
 */
function Square(
  { value, onSquareClick }: { value: SquareType; onSquareClick: () => void },
) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value !== "None" ? Disc({ value }) : null}
    </button>
  );
}

/**
 * 碁盤を表示するコンポーネント.
 */
function Board(
  { value, onSquareClick }: {
    value: SquareType[][];
    onSquareClick: (i: number, j: number) => void;
  },
) {
  const grid = value.map((row, i) => {
    let rowMaped = row.map((cell, j) => (
      <Square
        value={cell}
        onSquareClick={() => {
          onSquareClick(i, j);
        }}
        key={i * BOARD_DIM + j}
      />
    ));

    return <div className="board-row" key={i}>{rowMaped}</div>;
  });

  return <div className="board">{grid}</div>;
}

/**
 * ゲーム画面を描画するコンポーネント.
 */
function GameScreen() {
  const [gameState, { placeUserDisc, rollbackBoard, resetBoard }] =
    useGameState();

  let statusLine;
  if (gameState.isOnGame) {
    if (gameState.player === DISC_TYPE_HUMAN) {
      statusLine = "Place your disk!";
    } else {
      statusLine = "CPU loading...";
    }
  } else {
    const [black, white] = countDiscs(gameState.board);
    if (black > white) {
      statusLine = "Win! Black:" + black + " White: " + white;
    } else if (black < white) {
      statusLine = "Lose. Black:" + black + " White: " + white;
    } else {
      statusLine = "Draw. Black:" + black + " White: " + white;
    }
  }

  return (
    <div className="game-wrapper">
      <div className="nextplayer">
        <span>Next player:</span>
        <Disc value={gameState.player} />
      </div>
      <div className="status">{statusLine}</div>
      <Board value={gameState.board} onSquareClick={placeUserDisc} />
      <div className="button-container">
        <button className="rollbackBoard" onClick={rollbackBoard}>←</button>
        <button className="resetBoard" onClick={resetBoard}>Reset</button>
      </div>
    </div>
  );
}

/**
 * メインとなるアプリコンポーネント
 */
function App() {
  return (
    <div className="App">
      <GameScreen />
    </div>
  );
}

export default App;
