use crate::session_manager::PokerSession;
use crate::socket_manager::SocketManager;
use std::sync::{RwLock, Arc};

pub(crate) struct User {
    pub(crate) user_name: String,
    pub(crate) user_id: uuid::Uuid,
    pub(crate) socket_manager: Arc<RwLock<SocketManager>>,
}

