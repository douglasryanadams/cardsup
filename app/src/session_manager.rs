use crate::user::User;

pub(crate) struct PokerSession {
    session_name: String,
    session_id: String,
    users: Vec<User>,
}

