import { useState } from 'react';
import './App.css';


const dim = 8 // 升目の次元
const color = ["Black", "White"]

/**
 * 初期状態の碁盤を生成する関数
 */
function generateInitialGrid() {
  const initial: string[][] = Array.from({ length: dim }, () => Array(dim).fill(null));
  const hdim = Math.floor(dim / 2);
  initial[hdim - 1][hdim - 1] = "White";
  initial[hdim - 1][hdim - 0] = "Black";
  initial[hdim - 0][hdim - 1] = "Black";
  initial[hdim - 0][hdim - 0] = "White";
  return initial;
}

/**
 * 各碁盤の目を表示するコンポーネント
 */
function Square(
  { value, onSquareClick }: { value: string, onSquareClick: () => void }
) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value && <div className={`disc ${value}`}></div>}
    </button>
  );
}

/**
 * `nowplayer` にとって碁盤の状態 `squares` に
 * 配置可能な碁盤の目があるかどうかを判定する関数
 */
function possible_area(nowplayer: string, squares: string[][]) {
  const di = [1, 0, 1, 1, -1, 0, -1, -1];
  const dj = [0, 1, 1, -1, 0, -1, -1, 1];
  let ni;
  let nj;
  let l;
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      // 石が置かれていないすべての升目に対して配置可能場所を計算
      if (squares[i][j] === null) {
        for (let k = 0; k < dim; k++) {
          l = 1
          while (true) {
            ni = i + l * di[k];
            nj = j + l * dj[k];
            if (ni < 0 || ni > dim - 1 || nj < 0 || nj > dim - 1 || squares[ni][nj] == null) {
              break;
            }
            if (squares[ni][nj] === nowplayer) {
              if (l > 1) {
                return true;
              }
              break;
            }
            l++;
          }
        }
      }
    }
  }
  return false;
}

/**
 * `nowplayer` が (`i`, `j`) に置いた時に石をひっくり返す処理をする関数．
 * ひっくり返す場所がない場合 `false` を返す．
 */
function reverse(i: number, j: number, nowplayer: string, nextSquares: string[][]) {
  let reverseornot = false;
  const di = [1, 0, 1, 1, -1, 0, -1, -1];
  const dj = [0, 1, 1, -1, 0, -1, -1, 1];
  let ni;
  let nj;
  let l;
  for (let k = 0; k < dim; k++) {
    l = 1
    while (true) {
      ni = i + l * di[k];
      nj = j + l * dj[k];
      if (ni < 0 || ni > dim - 1 || nj < 0 || nj > dim - 1 || nextSquares[ni][nj] == null) {
        break;
      }
      if (nextSquares[ni][nj] === nowplayer) {
        if (l > 1) {
          reverseornot = true;
          for (let m = 1; m < l; m++) {
            nextSquares[ni - m * di[k]][nj - m * dj[k]] = nowplayer;
          }
        }
        break;
      }
      l++;
    }
  }
  return reverseornot;
}

/**
 * 碁盤の状態 `squares` から勝者を判定し，戻り値として返す関数．
 */
function gameEnd(squares: string[][]) {
  // 石のカウント
  let flat = squares.flat()
  let blackCount = flat.filter(s => s === "Black").length
  let whiteCount = flat.filter(s => s === "White").length

  // 勝者の判定
  let winner;
  if (blackCount > whiteCount) {
    winner = "Black won! Black:" + blackCount + " White: " + whiteCount;
  } else if (blackCount < whiteCount) {
    winner = "White won! Black:" + blackCount + " White: " + whiteCount;
  } else {
    winner = "The game is a draw. Black:" + blackCount + " White: " + whiteCount;
  }
  return winner;
}


/**
 * 碁盤を表示するコンポーネント
 */
function Board() {
  // 升目の状態
  const [xIsNext, setXIsNext] = useState(0);
  const [squares, setSquares] = useState(generateInitialGrid());
  const [prevSquares, setPrevSquares] = useState<string[][] | null>(null);
  const [game, setGame] = useState(null);
  const [back, setBack] = useState(true);
  let status;
  let word;
  let nowplayer = color[xIsNext]

  function copy2DArray<T>(array: T[][]) {
    return array.map(row => [...row]);
  };

  function handleClick(i: number, j: number) {
    if (squares[i][j] || game != null) {
      return;
    } else {
      setBack(true);
      const nextSquares = copy2DArray(squares);
      const tmpSquares = copy2DArray(squares);
      const reverseornot = reverse(i, j, nowplayer, nextSquares);
      if (reverseornot) {
        setPrevSquares(tmpSquares);
        nextSquares[i][j] = nowplayer;
        setSquares(nextSquares);
        setXIsNext(1 - xIsNext);
      }
    }
  }

  const doOver = () => {
    if (back && prevSquares != null) {
      setSquares(prevSquares);
      setXIsNext(1 - xIsNext);
      setGame(null);
      setPrevSquares(null);
      setBack(false);
    }
  }

  const resetBoard = () => {
    setXIsNext(0);
    setSquares(generateInitialGrid());
    setPrevSquares(null);
    setGame(null);
  }

  if (game === null) {
    status = "Next player: " + nowplayer;
    if (!possible_area(nowplayer, squares)) {
      // 置き場所がなくなった時の処理
      if (!possible_area(color[1 - xIsNext], squares)) {
        word = gameEnd(squares);
        status = "Game is over!";
      }
      else {
        word = "You can't place a piece anywhere!";
        setTimeout(() => {
          setXIsNext(1 - xIsNext);
        }, 3000);
      }
    }
    else {
      word = "Place your piece!"
    }
  }

  return (
    <div className="game-wrapper">
      <div className="nextplayer" key="status">{status}</div>
      <div className="status" key="word">{word}</div>
      {
        (function() {
          const grid = [];
          for (let i = 0; i < dim; i++) {
            const row = [];
            for (let j = 0; j < dim; j++) {
              row.push(<Square value={squares[i][j]} onSquareClick={() => handleClick(i, j)} />);
            }
            grid.push(<div className='board-row'>{row}</div>);
          }
          return <div className="status">{grid}</div>;
        }())
      }
      {/* <button onClick={resetBoard}>Reset Board</button> */}
      <div className="button-container">
        <button className="resetBoard" onClick={resetBoard}>Reset Board</button>
        <button className="doOver" onClick={doOver}>Do Over</button>
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
      <Board />
    </div>
  );
};

export default App;

