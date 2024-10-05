import init, * as wasm from "../wasm-crate/pkg";
import { DISC_TYPE_CPU, DISC_TYPE_HUMAN, DiscType } from "./game-logic";

init();

onmessage = (event: MessageEvent<[number, DiscType[][]]>) => {
  const [boardDim, board] = event.data;
  const boardParsed = Int32Array.from(
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
  const [i, j] = wasm.agent_policy(boardDim, boardParsed);
  console.log(board);
  postMessage([i, j]);
};
