use serde::{Deserialize, Serialize};
use tungstenite::Message;
use uuid::Uuid;

use log::{warn};
use std::fmt;


#[derive(Debug)]
pub enum MessageAction {
    CreateSession,
    JoinSession,
}

#[derive(Debug)]
pub struct MessageHeader {
    action: MessageAction,
    session_id: String,
    user_id: uuid::Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
struct MessageHeaderJson {
    action: String,
    session_id: String,
    user_id: String,
}

impl fmt::Display for MessageHeaderJson {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result{
        write!(f, "action={};session_id={},user_id={};", self.action, self.session_id, self.user_id)
    }
}

pub struct CreateSessionMessage {
    header: MessageHeader,
    session_name: String,
}

pub struct JoinSessionMessage {
    header: MessageHeader,
    session_id: uuid::Uuid,
    user_name: String,
}

pub struct ParseMessageError {
    message: String
}

impl fmt::Display for ParseMessageError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Error parsing message, because {}", self.message)
    }
}

/// Takes the websocket message body and extracts the header from the message
///
/// Personal Note: This is on of my first implementations of a Rust method.
pub fn parse_header(message: &Message) -> Result<MessageHeader, ParseMessageError> {

    let message_string = message.to_string();
    let header_json: MessageHeaderJson;
    match serde_json::from_str(&message_string) {
        Ok(j) => header_json = j,
        Err(_) => return Err(ParseMessageError {
            message: String::from("we could not parse string provided into a valid JSON Object.\
            Check for syntax errors.")
        })
    }

    let user_id_str;

    match Uuid::parse_str(&header_json.user_id) {
        Ok(id_str) => user_id_str = id_str,
        Err(_) => return Err(ParseMessageError {
            message: String::from("we could not parse string provided for 'user_id' into a \
            valid UUID.")
        })
    }

    let mut header = MessageHeader {
        action: MessageAction::CreateSession,
        session_id: header_json.session_id,
        user_id: user_id_str,
    };

    match header_json.action.as_str() {
        "create_session" => {
            header.action = MessageAction::CreateSession
        }
        "join_session" => {
            header.action = MessageAction::JoinSession
        }
        _ => warn!("Invalid action received: {:?}", header_json.action)
    }
    Ok(header)
}

#[cfg(test)]
mod tests {
    use log::{debug};
    use super::*;

    /// Tests the "happy path" with a valid request body
    #[test]
    fn test_parse_header() {

        let message_instance = MessageHeaderJson {
            action: String::from("create_session"),
            session_id: String::from("ECTO-1"),
            user_id: String::from("683d711e-fe25-443c-8102-43d4245a6884"),
        };
        debug!("message_instance={};", message_instance);
        let message_instance_string = serde_json::to_string(&message_instance).unwrap();
        debug!("message_instance_string={};", message_instance_string);
    }
}

