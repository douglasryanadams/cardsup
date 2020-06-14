use crate::session_manager::PokerSession;

pub struct User {
    user_name: String,
    user_id: uuid::Uuid,
    session: PokerSession,
}