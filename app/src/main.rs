mod socket_manager;
mod message;

use std::net::TcpListener;
use std::thread::spawn;

use tungstenite::{accept_hdr};
use tungstenite::handshake::server::{Request, Response};

use log::{info, debug};
use std::collections::HashMap;
use crate::socket_manager::SocketManager;
use crate::message::MessageAction;
// use std::collections::HashMap;

fn main() {
    env_logger::init();

    let server = TcpListener::bind("0.0.0.0:3012").unwrap();

    for stream in server.incoming() {

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
                        // let header = message::parse_header(&message)
                        //     .unwrap_or_else(|_| {
                        //         unimplemented!() // TODO
                        //     });
                        // debug!("    header constructed: {:?}", header);
                        //
                        // Echo
                        socket_manager.send_message(message_string);

                        // match header.action {
                        //     MessageAction::CreateSession => {}
                        //     MessageAction::JoinSession => {}
                        // }
                    }
                    None => continue
                }
            }
        });
    }
}