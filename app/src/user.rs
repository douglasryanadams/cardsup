use crate::session_manager::PokerSession;

use uuid::Uuid;

pub struct User {
    user_name: String,
    user_id: uuid::Uuid,
    session: PokerSession,
}