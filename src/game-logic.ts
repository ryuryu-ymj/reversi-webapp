import { useEffect, useRef, useState } from "react";
// Load Web Worker.
import WasmWorker from "./wasm-worker?worker";

/** 碁盤の升目の数(縦横) */
export const BOARD_DIM = 8;

/** 各碁盤の目の状態を表す型. 黒石, 白石 or 何も置かれていない. */
export type SquareType = "Black" | "White" | "None";
/** 石の種類. 黒石 or 白石. */
export type DiscType = "Black" | "White";
/** CPUプレイヤーの`DiscType`. */
export const DISC_TYPE_CPU: DiscType = "White";
/** Humanプレイヤーの`DiscType`. */
export const DISC_TYPE_HUMAN: DiscType = "Black";

/** CPUプレイヤーが次の手を打つまでの時間の最小値. */
const CPU_MIN_DELAY = 600;

/**
 * 初期状態の中央に４つの石が並べられた碁盤を生成する関数.
 *
 * 碁盤は`SquareType`の２次元配列で表す.
 */
function generateInitialBoard(): SquareType[][] {
  const board: SquareType[][] = Array.from(
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
 * `nowplayer` が (`i`, `j`) に置いた時にひっくり返される石の位置を配列で返す関数.
 *
 * (`i`, `j`) に石が既にある場合は空配列を返す.
 */
function reversedDiscs(
  i: number,
  j: number,
  player: DiscType,
  board: SquareType[][],
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
 * `player` にとって碁盤の状態 `board` に
 * 配置可能な碁盤の目があるかどうかを判定する関数.
 */
function hasPlacableSquares(player: DiscType, board: SquareType[][]) {
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

function copy2DArray<T>(array: T[][]) {
  return array.map(row => [...row]);
}

function generateNextBoard(
  board: SquareType[][],
  player: DiscType,
  i: number,
  j: number,
) {
  const revDiscs = reversedDiscs(i, j, player, board);
  if (revDiscs.length > 0) {
    const newBoard = copy2DArray(board);
    for (const [ri, rj] of revDiscs) {
      newBoard[ri][rj] = player;
    }
    newBoard[i][j] = player;
    return newBoard;
  } else {
    return;
  }
}

/**
 * ゲームの状態と操作を返すフック.
 */
export function useGameState(): [
  {
    /** 次の手を打つプレイヤー */
    player: DiscType;
    /** 碁盤の状態 */
    board: SquareType[][];
    /** ゲームが進行中か否か */
    isOnGame: boolean;
  },
  {
    /**
     * (`i`, `j`) にユーザーの石を置く.
     * スキップやCPUの行動は自動で行われる.
     */
    placeUserDisc: (i: number, j: number) => void;
    /** 碁盤の状態をユーザーが前回, 石を置いた直前の状態に戻す. */
    rollbackBoard: () => void;
    /** 碁盤の状態を初期状態に戻す. */
    resetBoard: () => void;
  },
] {
  const [player, setPlayer] = useState(DISC_TYPE_HUMAN);
  const [board, setBoard] = useState(generateInitialBoard());
  const [isOnGame, setIsOnGame] = useState(true);
  const [history, setHistory] = useState<SquareType[][][]>([]);

  /** wasmを別スレッドで実行するためのWeb Worker */
  const wasmWorkerRef = useRef<Worker | null>(null);
  useEffect(() => {
    wasmWorkerRef.current = new WasmWorker();
    return () => {
      wasmWorkerRef.current?.terminate();
    };
  }, []);

  function placeDisc(
    board: SquareType[][],
    player: DiscType,
    i: number,
    j: number,
  ) {
    const nextBoard = generateNextBoard(board, player, i, j);
    if (nextBoard !== undefined) {
      setBoard(nextBoard);
      if (player === DISC_TYPE_HUMAN) {
        setHistory([...history, board]);
      }

      let nextPlayer: DiscType = player === "Black" ? "White" : "Black";
      setPlayer(nextPlayer);
      if (!hasPlacableSquares(nextPlayer, nextBoard)) {
        nextPlayer = nextPlayer === "Black" ? "White" : "Black";
        setPlayer(nextPlayer);
        if (!hasPlacableSquares(nextPlayer, nextBoard)) {
          setIsOnGame(false);
          return;
        }
      }

      if (nextPlayer === DISC_TYPE_CPU && wasmWorkerRef.current) {
        const date1 = new Date();
        wasmWorkerRef.current.postMessage([BOARD_DIM, nextBoard]);
        wasmWorkerRef.current.onmessage = (
          event: MessageEvent<[number, number]>,
        ) => {
          const date2 = new Date();
          const dur = date2.getTime() - date1.getTime();
          const rest = CPU_MIN_DELAY - dur;

          const [i, j] = event.data;
          console.log(i, j);
          if (rest > 0) {
            setTimeout(() => {
              placeDisc(nextBoard, DISC_TYPE_CPU, i, j);
            }, rest);
          } else {
            placeDisc(nextBoard, DISC_TYPE_CPU, i, j);
          }
        };
      }
    }
  }

  function placeUserDisc(i: number, j: number) {
    if (isOnGame && player === DISC_TYPE_HUMAN) {
      placeDisc(board, DISC_TYPE_HUMAN, i, j);
    }
  }

  const rollbackBoard = () => {
    wasmWorkerRef.current?.terminate();
    wasmWorkerRef.current = new WasmWorker();

    if (history.length > 0) {
      const prevBoard = history[history.length - 1];
      setBoard(prevBoard);
      setHistory(history.slice(0, -1));
      setPlayer(DISC_TYPE_HUMAN);
      setIsOnGame(true);
    }
  };

  const resetBoard = () => {
    wasmWorkerRef.current?.terminate();
    wasmWorkerRef.current = new WasmWorker();

    setBoard(generateInitialBoard());
    setPlayer(DISC_TYPE_HUMAN);
    setHistory([]);
    setIsOnGame(true);
  };

  const gameState = { player, board, isOnGame };
  return [gameState, { placeUserDisc, rollbackBoard, resetBoard }];
}

/**
 * 碁盤の状態 `board` から黒石と白石の数をカウントし, 返す関数.
 */
export function countDiscs(board: SquareType[][]) {
  // 石のカウント
  let boardFlat = board.flat();
  let blackCount = boardFlat.filter(s => s === "Black").length;
  let whiteCount = boardFlat.filter(s => s === "White").length;

  return [blackCount, whiteCount];
}
