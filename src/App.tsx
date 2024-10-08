import "./App.css";
import { Board, Disc } from "./Board";
import { countDiscs, DISC_TYPE_HUMAN, useGameState } from "./game-logic";

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
