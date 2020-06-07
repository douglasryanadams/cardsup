mod socket_manager;
mod message;

use std::net::TcpListener;
use std::thread::spawn;

use tungstenite::{accept_hdr};
use tungstenite::handshake::server::{Request, Response};

use log::{info, debug};
use std::{env, process};
use std::collections::HashMap;
use crate::socket_manager::SocketManager;
use crate::message::{MessageAction, MessageHeader, ResponseJsonString};
// use std::collections::HashMap;

fn main() {
    env_logger::init();

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

            loop {
                match socket_manager.read_message() {
                    Some(message) => {
                        let message_string = message.to_string();
                        debug!("  ->> received message: {}", message_string);

                        let header: MessageHeader;
                        match message::parse_header(&message) {
                            Ok(message_header) => header = message_header,
                            Err(error) => {
                                socket_manager.send_message(error.get_response_json_string());
                                continue;
                            }
                        };
                        debug!("    header constructed: {:?}", header);

                        match header.action {
                            MessageAction::CreateSession => {}
                            MessageAction::JoinSession => {}
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