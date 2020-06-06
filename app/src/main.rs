use std::net::TcpListener;
use std::thread::spawn;

use tungstenite::{accept_hdr};
use tungstenite::handshake::server::{Request, Response};

use log::{warn, info, debug};
// use std::collections::HashMap;

mod session_manager;
mod websocket;

fn main() {
    env_logger::init();
    let server = TcpListener::bind("0.0.0.0:3012").unwrap();
    // let session_map = HashMap::new();
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

            loop {
                match websocket.read_message() {
                    Ok(message) => {
                        debug!("  ->> received message: {}", message.to_string());
                        let header = websocket::parse_header(&message)
                            .unwrap_or_else(|_| {
                                panic!("placeholder implementation")
                            });
                        debug!("    header constructed: {:?}", header);

                        // if message.is_binary() || message.is_text() {
                        //     // let new_message = Message::Text(String::from("Hello World"));
                        //     debug!("  <<- sending message: {}", message.to_string());
                        //     websocket.write_message(message).unwrap();
                        // }
                    }
                    Err(error) => match error {
                        tungstenite::error::Error::AlreadyClosed => {
                            // Nothing to be done
                        }
                        _ => warn!("  ->> error reading message: {:?}", error)
                    }
                }
            }
        });
    }
}