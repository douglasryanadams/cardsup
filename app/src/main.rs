mod socket_manager;
mod messages;
mod session_manager;
mod user;

use crate::socket_manager::SocketManager;
use crate::messages::MessageAction;
use crate::messages::headers::{RequestHeader};
use crate::messages::error_response::ErrorResponseJson;
use crate::session_manager::PokerSession;
use crate::user::User;

use std::net::TcpListener;
use std::thread::spawn;
use std::{env, process};
use std::collections::HashMap;

use tungstenite::{accept_hdr};
use tungstenite::handshake::server::{Request, Response};

use log::{info, debug};
use uuid::Uuid;

fn main() {
    env_logger::init();

    let sessions: HashMap<String, PokerSession> = HashMap::new();
    let users: HashMap<Uuid, User> = HashMap::new();


    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Arguments required: cardsup [bind interface IP] [bind port]");
        process::exit(1);
    }
    let interface_ip = &args[1];
    let port = &args[2];

    let server = TcpListener::bind(format!("{}:{}", interface_ip, port)).unwrap();

    // Create a new thread ('spawn') for each connection that comes in to the server
    // started above on port 3012.
    for stream in server.incoming() {
        // TODO Clean up all the .unwrap() calls with real error handling

        // Starts a thread for each connection that's established
        spawn(move || {
            let callback = |request: &Request, response: Response| {
                let headers = request.headers();
                debug!("--> headers:");
                for (header_key, header_value) in headers.iter() {
                    let header_value_str = header_value.to_str().unwrap();
                    debug!("  --> {}: {}", header_key, header_value_str);
                    if header_key.eq("user-agent") {
                        info!("--> connection from: {}", header_value_str)
                    }
                }
                Ok(response)
            };

            let mut websocket = accept_hdr(stream.unwrap(), callback).unwrap();
            let mut socket_manager = SocketManager::new(&mut websocket);

            // Main event loop that handles messages and dispatches to different business logic depending on the message type
            loop {
                match socket_manager.read_message() {
                    Some(message) => {
                        let message_string = message.to_string();
                        debug!("  ->> received message: {}", message_string);

                        let header: RequestHeader;
                        match messages::headers::parse_header(&message) {
                            Ok(message_header) => header = message_header,
                            Err(error) => {
                                let error_message = ErrorResponseJson::new_from_parse_message_error(error);
                                let error_message_string = messages::to_json_string(error_message);
                                socket_manager.send_message(error_message_string);
                                continue;
                            }
                        };
                        debug!("    header=<{:?}>;", header);

                        match header.get_action() {
                            MessageAction::CreateSession => {
                                let create_session = messages::create_session::parse_create_session(&message, header);
                                debug!("    create_session=<{:?}>;", create_session);
                            }
                            MessageAction::JoinSession => {}
                            MessageAction::CloseSession => {}
                            MessageAction::ResetVotes => {}
                            MessageAction::RevealVotes => {}
                            MessageAction::SetCurrentLabel => {}
                            MessageAction::CastVote => {}
                        }

                        // Echo
                        // socket_manager.send_message(message_string);
                    }
                    None => continue
                }
            }
        });
    }
}