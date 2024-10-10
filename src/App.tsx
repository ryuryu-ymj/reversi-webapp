import "./App.css";
import { Board, Disc } from "./Board";
import { countDiscs, DISC_TYPE_HUMAN, useGameState } from "./game-logic";
import { IconButton } from "./IconButton";

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
    <div className="game-screen">
      <div className="button-container">
        <IconButton iconName="arrow_back" onClick={rollbackBoard} />
        <IconButton iconName="restart_alt" onClick={resetBoard} />
      </div>

      <div className="next-player">
        <span>Next:</span>
        <Disc value={gameState.player} />
      </div>

      <div className="status-line">{statusLine}</div>

      <Board value={gameState.board} onSquareClick={placeUserDisc} />
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
