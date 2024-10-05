use crate::reversi::*;

pub type Utility = i32;

pub fn policy(state: &State) -> Option<Action> {
    minimax(state, 0, 6).1
}

fn utility(board: &Board) -> Utility {
    let count_agent = board
        .iter()
        .flatten()
        .filter(|s| s == &&Some(Player::Agent))
        .count() as i32;
    let count_opponent = board
        .iter()
        .flatten()
        .filter(|s| s == &&Some(Player::Opponent))
        .count() as i32;
    let utility = count_agent - count_opponent;
    return utility;
}

fn minimax(state: &State, depth: u32, max_depth: u32) -> (Utility, Option<Action>) {
    if depth >= max_depth {
        return (utility(&state.board), None);
    }

    let actions = legal_actions(state);
    if actions.is_empty() {
        let next_state = next_state(state, None);
        if legal_actions(&next_state).is_empty() {
            return (utility(&state.board), None);
        }
    }

    let utils = actions.iter().map(|a| {
        let u = minimax(&next_state(state, Some(a)), depth + 1, max_depth).0;
        (u, Some(*a))
    });
    let util = if state.next_player == Player::Agent {
        utils.max()
    } else {
        utils.min()
    };

    if let Some(util) = util {
        return util;
    } else {
        let next_state = next_state(state, None);
        return minimax(&next_state, depth + 1, max_depth);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_board(from: Vec<Vec<i32>>) -> Board {
        from.iter()
            .map(|row| {
                row.iter()
                    .map(|i| match i {
                        1 => Some(Player::Agent),
                        -1 => Some(Player::Opponent),
                        _ => None,
                    })
                    .collect()
            })
            .collect()
    }

    fn dbg_board(board: &Board) {
        for row in board {
            eprintln!();
            for s in row {
                match s {
                    Some(Player::Agent) => eprint!("o"),
                    Some(Player::Opponent) => eprint!("x"),
                    None => eprint!("_"),
                }
            }
        }
        eprintln!();
    }

    #[test]
    fn test_policy() {
        let test_set = [(vec![
            vec![00, 00, 00, 00],
            vec![00, 01, -1, 00],
            vec![00, -1, 01, 00],
            vec![00, 00, 00, 00],
        ],)];

        for (board,) in test_set {
            let mut state = State {
                board: parse_board(board),
                next_player: Player::Agent,
            };
            for _ in 0..10 {
                dbg_board(&state.board);
                let action = policy(&state);
                state = next_state(&state, action.as_ref());
                eprintln!("{:?}", action);
            }
            assert!(false);
        }
    }
}
