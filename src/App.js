import { useState } from 'react';
import './App.css';


const dim = 8 //升目の次元 
const color = ["Black", "White"]
const initialGrid = () => { //初期状態
  const initial = Array.from({ length: dim }, () => Array(dim).fill(null));
  initial[3][3] = "White";
  initial[3][4] = "Black";
  initial[4][3] = "Black";
  initial[4][4] = "White";
  return initial;
}

function Square({ value, onSquareClick }) { //各升目の状態
  return (
    <button className="square" onClick={onSquareClick}>
      {value && <div className={`disc ${value}`}></div>}
    </button>
  );
}

function possible_area(nowplayer, squares) { //配置可能場所をそれぞれの場合に対して計算
  const di = [1, 0, 1, 1, -1, 0, -1, -1];
  const dj = [0, 1, 1, -1, 0, -1, -1, 1];
  let ni;
  let nj;
  let l;
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      if (squares[i][j] === null) { //石が置かれていないすべての升目に対して配置可能場所を計算
        for (let k = 0; k < 8; k++) {
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

function reverse(i, j, nowplayer, nextSquares) {
  //nowplayerが(i,j)に置いた時にひっくり返す石の場所を計算
  //ひっくり返す場所がなければfalseを返してそこには置けないようにする
  let reverseornot = false;
  const di = [1, 0, 1, 1, -1, 0, -1, -1];
  const dj = [0, 1, 1, -1, 0, -1, -1, 1];
  let ni;
  let nj;
  let l;
  for (let k = 0; k < 8; k++) {
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

function gameEnd(squares) {
  const countColors = (array) => {
    let blackCount = 0;
    let whiteCount = 0;

    const countInArray = (arr) => {
      arr.forEach(item => {
        if (Array.isArray(item)) {
          countInArray(item);
        } else {
          if (item === 'Black') {
            blackCount += 1;
          } else if (item === 'White') {
            whiteCount += 1;
          }
        }
      });
    };

    countInArray(array);

    return { blackCount, whiteCount };
  };

  let c;
  let winner;
  c = countColors(squares);
  if (c.blackCount > c.whiteCount) {
    winner = "Black won! Black:" + c.blackCount + " White: " + c.whiteCount;
  } else if (c.blackCount < c.whiteCount) {
    winner = "White won! Black:" + c.blackCount + " White: " + c.whiteCount;
  } else {
    winner = "The game is a draw. Black:" + c.blackCount + " White: " + c.whiteCount;
  }
  return winner;
}


function Board() {
  //升目の状態
  const [xIsNext, setXIsNext] = useState(0);
  const [squares, setSquares] = useState(initialGrid());
  const [prevSquares, setPrevSquares] = useState(null);
  const [game, setGame] = useState(null);
  const [back, setBack] = useState(true);
  let status;
  let word;
  let nowplayer = color[xIsNext]

  const copy2DArray = (array) => {
    return array.map(row => [...row]);
  };

  function handleClick(i, j) {
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
    if(back && prevSquares!=null){
      setSquares(prevSquares);
      setXIsNext(1 - xIsNext);
      setGame(null);
      setPrevSquares(null);
      setBack(false);
    }
  }

  const resetBoard = () => {
    setXIsNext(0);
    setSquares(initialGrid());
    setPrevSquares(null);
    setGame(null);
  }

  if (game === null) {
    status = "Next player: " + nowplayer;
    if (!possible_area(nowplayer, squares)) {
      //置き場所がなくなった時の処理
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
    <div>
      <div className="nextplayer" key="status">{status}</div>
      <div className="status" key="word">{word}</div>
      {
        (function () {
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
      <button onClick={resetBoard}>Reset Board</button>
      <button onClick={doOver}>Do Over</button>
    </div>
  );
}

const App = () => {
  return (
    <div className="App">
      <Board />
    </div>
  );
};

export default App;