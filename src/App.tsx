import { useEffect, useState } from "react";
import "./App.css";

import init, * as wasm from "../wasm-crate/pkg";

/** 碁盤の升目の数(縦横) */
const BOARD_DIM = 8;

/** 各碁盤の目の状態を表す型. 黒石, 白石 or 何も置かれていない. */
type SquareState = "Black" | "White" | "None";
/** 石の種類. 黒石 or 白石. */
type DiscType = "Black" | "White";
/** CPUプレイヤーの`DiscType`. */
const DISC_TYPE_CPU: DiscType = "White";
/** Humanプレイヤーの`DiscType`. */
const DISC_TYPE_HUMAN: DiscType = "Black";

/**
 * 初期状態の中央に４つの石が並べられた碁盤を生成する関数.
 *
 * 碁盤は`SquareType`の２次元配列で表す.
 */
function generateInitialBoard(): SquareState[][] {
  const board: SquareState[][] = Array.from(
    { length: BOARD_DIM },
    () => Array(BOARD_DIM).fill("None"),
  );
  const hdim = Math.floor(BOARD_DIM / 2);
  board[hdim - 1][hdim - 1] = "White";
  board[hdim - 1][hdim - 0] = "Black";
  board[hdim - 0][hdim - 1] = "Black";
  board[hdim - 0][hdim - 0] = "White";
  return board;
}

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
  { value, onSquareClick }: { value: SquareState; onSquareClick: () => void },
) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value !== "None" ? Disc({ value }) : null}
    </button>
  );
}

/**
 * `player` にとって碁盤の状態 `board` に
 * 配置可能な碁盤の目があるかどうかを判定する関数.
 */
function hasPlacableSquares(player: DiscType, board: SquareState[][]) {
  for (let i = 0; i < BOARD_DIM; i++) {
    for (let j = 0; j < BOARD_DIM; j++) {
      if (reversedDiscs(i, j, player, board).length > 0) {
        // 1つでも置ける場所があればtrueを返す.
        return true;
      }
    }
  }
  return false;
}

/**
 * `nowplayer` が (`i`, `j`) に置いた時にひっくり返される石の位置を配列で返す関数.
 *
 * (`i`, `j`) に石が既にある場合は空配列を返す.
 */
function reversedDiscs(
  i: number,
  j: number,
  player: DiscType,
  board: SquareState[][],
): [number, number][] {
  if (board[i][j] !== "None") {
    return [];
  }

  let reverse: [number, number][] = [];
  // ひっくり返す石を調べる8方向.
  const dijList = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  for (const [di, dj] of dijList) {
    for (let len = 1; len < BOARD_DIM; len++) {
      const ni = i + len * di;
      const nj = j + len * dj;
      if (
        ni < 0 || ni >= BOARD_DIM || nj < 0 || nj >= BOARD_DIM
        || board[ni][nj] === "None"
      ) {
        break;
      }
      if (board[ni][nj] === player) {
        if (len > 1) {
          for (let l = 1; l < len; l++) {
            // 1個以上相手の石が並んでいて且つ自分の石で挟まれた場合にのみ,
            // 間の石をひっくり返す.
            reverse.push([i + l * di, j + l * dj]);
          }
        }
        break;
      }
    }
  }
  return reverse;
}

/**
 * 碁盤の状態 `board` から勝者を判定し，戻り値として返す関数.
 */
function checkWinner(board: SquareState[][]) {
  // 石のカウント
  let boardFlat = board.flat();
  let blackCount = boardFlat.filter(s => s === "Black").length;
  let whiteCount = boardFlat.filter(s => s === "White").length;

  // 勝者の判定
  let winner;
  if (blackCount > whiteCount) {
    winner = "Black won! Black:" + blackCount + " White: " + whiteCount;
  } else if (blackCount < whiteCount) {
    winner = "White won! Black:" + blackCount + " White: " + whiteCount;
  } else {
    winner = "The game is a draw. Black:" + blackCount + " White: "
      + whiteCount;
  }
  return winner;
}

/**
 * 碁盤を表示するコンポーネント.
 */
function Board() {
  const [player, setPlayer] = useState<DiscType>(DISC_TYPE_HUMAN);
  const [isOnGame, setIsOnGame] = useState(true);
  const [board, setBoard] = useState(generateInitialBoard());
  const [history, setHistory] = useState<SquareState[][][]>([]);

  function copy2DArray<T>(array: T[][]) {
    return array.map(row => [...row]);
  }

  function nextPlayer() {
    return player === "Black" ? "White" : "Black";
  }

  function handleClick(i: number, j: number) {
    if (!isOnGame || board[i][j] !== "None") {
      return;
    } else {
      const revDiscs = reversedDiscs(i, j, player, board);
      if (revDiscs.length > 0) {
        setHistory([...history, board]);
        const newBoard = copy2DArray(board);
        for (const [ri, rj] of revDiscs) {
          newBoard[ri][rj] = player;
        }
        newBoard[i][j] = player;
        setBoard(newBoard);
        setPlayer(nextPlayer());
      }
    }
  }

  const rollbackBoard = () => {
    if (history.length > 0) {
      // setSquares(prevSquares);
      // history.pop();
      const prevBoard = history[history.length - 1];
      setBoard(prevBoard);
      setHistory(history.slice(0, -1));
      setPlayer(DISC_TYPE_HUMAN);
      setIsOnGame(true);
    }
  };

  const resetBoard = () => {
    setBoard(generateInitialBoard());
    setPlayer(DISC_TYPE_HUMAN);
    setHistory([]);
    setIsOnGame(true);
  };

  let statusLine: string;
  if (isOnGame) {
    if (player === DISC_TYPE_HUMAN) {
      statusLine = "Place your piece!";
    } else {
      statusLine = "CPU is thinking...";
    }
  } else {
    statusLine = checkWinner(board);
  }

  useEffect(() => {
    let unmounted = false;

    if (isOnGame) {
      if (player === DISC_TYPE_HUMAN) {
        if (!hasPlacableSquares(player, board)) {
          // 置き場所がなくなった時の処理
          if (!hasPlacableSquares(nextPlayer(), board)) {
            setIsOnGame(false);
          } else {
            setPlayer(nextPlayer());
          }
        }
      } else {
        const board_parsed = Int32Array.from(
          board.flat().map((e) => {
            switch (e) {
              case DISC_TYPE_CPU:
                return 1;
              case DISC_TYPE_HUMAN:
                return -1;
              default:
                return 0;
            }
          }),
        );

        const wasm_task = async () => {
          const [i, j] = wasm.agent_policy(BOARD_DIM, board_parsed);
          console.log(i, j);

          if (!unmounted) {
            if (i !== -1 && j !== -1) {
              const revDiscs = reversedDiscs(i, j, player, board);
              if (revDiscs.length > 0) {
                const newBoard = copy2DArray(board);
                for (const [ri, rj] of revDiscs) {
                  newBoard[ri][rj] = player;
                }
                newBoard[i][j] = player;
                setBoard(newBoard);
                setPlayer(nextPlayer());
              } else {
                console.error("Error: Invalid cpu action.");
                setPlayer(nextPlayer());
              }
            } else {
              if (!hasPlacableSquares(nextPlayer(), board)) {
                setIsOnGame(false);
              } else {
                setPlayer(nextPlayer());
              }
            }
          }
        };
        setTimeout(wasm_task);
      }
    }

    return () => {
      unmounted = true;
    };
  }, [board, player, isOnGame]);

  return (
    <div className="game-wrapper">
      <div className="nextplayer">
        <span>Next player:</span>
        <Disc value={player} />
      </div>
      <div className="status" key="word">{statusLine}</div>
      {function() {
        const grid = [];
        for (let i = 0; i < BOARD_DIM; i++) {
          const row = [];
          for (let j = 0; j < BOARD_DIM; j++) {
            row.push(
              <Square
                value={board[i][j]}
                onSquareClick={() => {
                  if (player === DISC_TYPE_HUMAN) handleClick(i, j);
                }}
                key={i * BOARD_DIM + j}
              />,
            );
          }
          grid.push(<div className="board-row" key={i}>{row}</div>);
        }
        return <div className="board">{grid}</div>;
      }()}
      {/* <button onClick={resetBoard}>Reset Board</button> */}
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
  // Initialize wasm module.
  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      <Board />
    </div>
  );
}

export default App;
