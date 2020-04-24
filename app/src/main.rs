use std::net::TcpListener;
use std::thread::spawn;

use tungstenite::{accept_hdr, Message};
use tungstenite::handshake::server::{Request, Response};

use log::{info, debug};

fn main() {
    env_logger::init();
    let server = TcpListener::bind("127.0.0.1:3012").unwrap();
    for stream in server.incoming() {
        spawn(move || {
            let callback = |_req: &Request, response: Response| {
                info!("Received WebSocket Connection");
                Ok(response)
            };

            let mut websocket = accept_hdr(stream.unwrap(), callback).unwrap();

            loop {
                let msg = websocket.read_message().unwrap();
                if msg.is_binary() || msg.is_text() {
                    let new_message = Message::Text(String::from("Hello World"));
                    debug!("   sending message: {}", new_message.to_string());
                    websocket.write_message(new_message).unwrap();
                }
            }
        });
    }
}