use std::{ops::Neg, usize};

#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub enum Player {
    Agent,
    Oponent,
}

impl Neg for Player {
    type Output = Player;

    fn neg(self) -> Self::Output {
        match &self {
            Player::Agent => Player::Oponent,
            Player::Oponent => Player::Agent,
        }
    }
}

pub type Board = Vec<Vec<Option<Player>>>;
pub type State = (Board, Player);
pub type Action = (usize, usize);

fn checked_move(start: usize, len: usize, step: i8) -> Option<usize> {
    if step > 0 {
        Some(start + len * (step as usize))
    } else if step < 0 {
        usize::checked_sub(start, len * (step.abs() as usize))
    } else {
        Some(start)
    }
}

pub fn reversed_discs(state: &State, action: &Action) -> Vec<Action> {
    let (board, player) = state;

    if board[action.0][action.1] != None {
        return vec![];
    }

    let mut ret = vec![];

    let dij = [
        (1, 0),
        (1, 1),
        (0, 1),
        (-1, 1),
        (-1, 0),
        (-1, -1),
        (0, -1),
        (1, -1),
    ];
    for (di, dj) in dij {
        for len in 1..usize::MAX {
            let Some(i) = checked_move(action.0, len, di) else {
                break;
            };
            let Some(j) = checked_move(action.1, len, dj) else {
                break;
            };
            match &board.get(i).map(|e| e.get(j)) {
                &Some(Some(Some(p))) if p != player => continue,
                &Some(Some(Some(p))) if p == player => {
                    if len > 1 {
                        ret.extend((1..len).map(|l| {
                            (
                                checked_move(action.0, l, di).unwrap(),
                                checked_move(action.1, l, dj).unwrap(),
                            )
                        }));
                    }
                    break;
                }
                _ => break,
            }
        }
    }
    ret
}

pub fn all_actions(state: &State) -> Vec<Action> {
    let (board, _) = state;
    board
        .iter()
        .enumerate()
        .flat_map(|(i, row)| (0..row.len()).map(move |j| (i, j)))
        .collect()
}

pub fn possible_actions(state: &State) -> Vec<Action> {
    let (board, _) = state;
    board
        .iter()
        .enumerate()
        .flat_map(|(i, row)| {
            (0..row.len()).filter_map(move |j| {
                let rev = reversed_discs(state, &(i, j));
                if rev.is_empty() {
                    None
                } else {
                    Some((i, j))
                }
            })
        })
        .collect()
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
                        -1 => Some(Player::Oponent),
                        _ => None,
                    })
                    .collect()
            })
            .collect()
    }

    #[test]
    fn test_reversed_discs() {
        let tests = [
            (
                vec![
                    vec![00, 00, -1, 01],
                    vec![01, -1, -1, 00],
                    vec![00, -1, -1, -1],
                    vec![00, 01, 00, -1],
                ],
                (1, 3),
                vec![(1, 1), (1, 2), (2, 2)],
            ),
            (
                vec![
                    vec![00, 00, -1, 01],
                    vec![01, -1, -1, 00],
                    vec![00, 00, -1, -1],
                    vec![00, 01, 00, -1],
                ],
                (3, 2),
                vec![],
            ),
            (
                vec![
                    vec![00, 00, -1, 01],
                    vec![01, -1, -1, 00],
                    vec![00, -1, -1, -1],
                    vec![00, 01, 00, -1],
                ],
                (1, 0),
                vec![],
            ),
        ];

        for (board, action, mut expected) in tests {
            let board = parse_board(board);
            let mut result = reversed_discs(&(board, Player::Agent), &action);
            result.sort();
            expected.sort();
            assert_eq!(result, expected);
        }
    }

    #[test]
    fn test_possible_actions() {
        let tests = [
            (
                vec![
                    vec![00, 00, 00, 00],
                    vec![00, -1, 01, 00],
                    vec![00, 01, -1, 00],
                    vec![00, 00, 00, 00],
                ],
                vec![(0, 1), (1, 0), (2, 3), (3, 2)],
            ),
            (
                vec![
                    vec![-1, 00, -1, 00],
                    vec![01, -1, -1, 00],
                    vec![00, -1, -1, -1],
                    vec![00, -1, 00, -1],
                ],
                vec![(1, 3), (3, 2)],
            ),
        ];

        for (board, mut expected) in tests {
            let board = parse_board(board);
            let mut result = possible_actions(&(board, Player::Agent));
            result.sort();
            expected.sort();
            assert_eq!(result, expected);
        }
    }
}
