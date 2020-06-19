use std::net::TcpStream;
use std::collections::HashMap;
use log::{info, debug};

use uuid::Uuid;
use tungstenite::WebSocket;

use crate::socket_controller::SocketController;

pub(crate) struct MessageManager {
    sessions: HashMap<Uuid, Session>
}

/// This is a "one struct to rule them all" implementation
/// Everything this module exposes is available through
/// the MesssageManager implementation details are abstracted
/// behind these methods
impl MessageManager {
    pub(crate) fn new() -> MessageManager {
        MessageManager {
            sessions: HashMap::new()
        }
    }

    pub (crate) fn execute_loop_step() -> () {

    }

    fn add_session(&mut self, session_name: String, owner_name: String, owner_websocket: WebSocket<TcpStream>) -> () {
        info!("Building owner: {}", owner_name);
        let owner_id = Uuid::new_v4();
        debug!("  owner_id={};", owner_id);
        let owner = User {
            id: owner_id.clone(),
            name: owner_name,
            websocket: owner_websocket,
        };
        let mut first_user_map = HashMap::new();
        first_user_map.insert(owner_id.clone(), owner);

        info!("Building session: {}", session_name);
        let session_id = Uuid::new_v4();
        debug!("  session_id={};", session_id);

        let session = Session {
            id: session_id.clone(),
            name: session_name,
            users: Default::default(),
        };

        self.sessions.insert(session.id.clone(), session);
    }
}

struct Session {
    id: Uuid,
    name: String,
    users: HashMap<Uuid, User>,
}

struct User {
    id: Uuid,
    name: String,
    websocket: WebSocket<TcpStream>,
}

