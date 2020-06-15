use std::net::TcpListener;
use std::{process, env, thread};
use log::{warn, info, debug};
use tungstenite::error::Error::AlreadyClosed;
use uuid::Uuid;
use std::sync::{Once, RwLock, Arc};
use std::collections::HashMap;
use tungstenite::WebSocket;

fn main() {
    env_logger::init();
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Arguments required: cardsup [bind interface IP] [bind port]");
        process::exit(1);
    }
    let interface_ip = &args[1];
    let port = &args[2];

    let server = TcpListener::bind(format!("{}:{}", interface_ip, port))
        .expect("Failed to bind to provided IP and port!");


    for stream in server.incoming() {
        thread::spawn(move || {
            let mut websocket = tungstenite::accept(stream.unwrap()).unwrap();
            let socket_id = Uuid::new_v4();
            info!("New connection: {}", socket_id);
            let closed_already_error = Once::new();

            loop {
                let message = match websocket.read_message() {
                    Ok(message) => Some(message),
                    Err(error) => match error {
                        AlreadyClosed => {
                            closed_already_error.call_once(|| {
                                debug!("  [WebSocket <{}> already closed]", &socket_id);
                            });
                            None
                        }
                        _ => {
                            warn!("  Failed to read message: {:?}", error);
                            None
                        }
                    }
                };

                match message {
                    Some(message) => {
                        if message.is_binary() || message.is_text() {
                            match websocket.write_message(message) {
                                Ok(_) => {}
                                Err(error) => {
                                    warn!("  Failed to send message: {:?}", error)
                                }
                            }
                        }
                    }
                    None => continue
                };
            }
        });
    }
}