use crate::reversi::*;

pub fn policy(state: &State) -> Option<Action> {
    let actions = all_actions(state);
    actions
        .into_iter()
        .filter_map(|a| {
            let rev = reversed_discs(state, &a).len();
            if rev > 0 {
                Some((rev, a))
            } else {
                None
            }
        })
        .max()
        .map(|p| p.1)
}
