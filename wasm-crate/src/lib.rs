use reversi::Player;
use wasm_bindgen::prelude::*;

mod greedy;
mod minimax;
mod reversi;

#[wasm_bindgen]
pub fn agent_policy(board_dim: usize, board_state: Vec<i32>) -> Vec<i32> {
    let board = board_state
        .chunks(board_dim)
        .map(|row| {
            row.into_iter()
                .map(|i| match i {
                    1 => Some(Player::Agent),
                    -1 => Some(Player::Oponent),
                    _ => None,
                })
                .collect()
        })
        .collect();
    let state = (board, Player::Agent);
    let action = greedy::policy(&state);
    match action {
        Some((i, j)) => vec![i as i32, j as i32],
        None => vec![-1, -1],
    }
}
