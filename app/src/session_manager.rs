use crate::user::User;

pub(crate) struct PokerSession {
    pub(crate) session_name: String,
    pub(crate) users: Vec<User>,
}

