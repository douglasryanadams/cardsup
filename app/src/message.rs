use serde::{Deserialize, Serialize};
use tungstenite::{Message};
use uuid::Uuid;

use log::{warn, debug};
use std::fmt;

// --
// Useful Traits
// -----

pub fn to_json_string<T: Serialize>(thing: T) -> String {
    return match serde_json::to_string(&thing) {
        Ok(s) => s,
        Err(error) => {
            warn!("Failed to convert Object into a JSON String.");
            String::from("[Server Error - 500:001]")
        }
    };
}

// --
// Handling Response Formatting
// -----

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct ResponseHeaderJson {
    message_type: String,
    status_code: u16,
    status: String,
}

impl fmt::Display for ResponseHeaderJson {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "response_type=<{}>;status_code=<{}>;status=<{}>",
            self.message_type, self.status_code, self.status
        )
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub(crate) struct ErrorResponseJson {
    header: ResponseHeaderJson,
    message: String,
}

impl fmt::Display for ErrorResponseJson {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "header=<{}>;message=<{}>;", self.header, self.message)
    }
}

impl ErrorResponseJson {
    fn new(error_message: String) -> ErrorResponseJson {
        return ErrorResponseJson {
            header: ResponseHeaderJson {
                message_type: String::from("response"),
                status_code: 400,
                status: String::from("bad_request"),
            },
            message: error_message,
        };
    }

    pub(crate) fn new_from_parse_message_error(parse_message_error: ParseMessageError) -> ErrorResponseJson {
        return ErrorResponseJson::new(parse_message_error.message);
    }
}

// --
// Message Headers
// -----

#[derive(Debug, PartialEq)]
pub(crate) struct RequestHeader {
    pub(crate) action: MessageAction,
    session_id: String,
    user_id: uuid::Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
struct RequestHeaderJson {
    action: String,
    session_id: String,
    user_id: String,
}

impl fmt::Display for RequestHeaderJson {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "action=<{}>;session_id=<{}>;user_id=<{}>;", self.action, self.session_id, self.user_id)
    }
}

// --
// Supported Message Actions
// ---
/// Contains supported Message Actions
#[derive(Debug, PartialEq)]
pub(crate) enum MessageAction {
    CreateSession,
    JoinSession,
    CloseSession,
    ResetVotes,
    RevealVotes,
    SetCurrentLabel,
    CastVote,
}

// --
// Specific Messages
// -----

pub(crate) struct CreateSessionMessage {
    header: RequestHeader,
    session_name: String,
}

pub(crate) struct JoinSessionMessage {
    header: RequestHeader,
    session_id: uuid::Uuid,
    user_name: String,
}


#[derive(Debug)]
pub(crate) struct ParseMessageError {
    message: String,
}

impl fmt::Display for ParseMessageError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "message=<{}>;", self.message)
    }
}

/// Takes the websocket message body and extracts the header from the message
///
/// Personal Note: This is on of my first implementations of a Rust method.
pub(crate) fn parse_header(message: &Message) -> Result<RequestHeader, ParseMessageError> {
    let message_string = message.to_string();
    let header_json: RequestHeaderJson = match serde_json::from_str(&message_string) {
        Ok(j) => j,
        Err(_) => {
            debug!("Invalid JSON Format: {}", &message_string);
            return Err(
                ParseMessageError {
                    message: String::from("Error parsing the string provided \
                    into a valid JSON Object. \
                    Check for syntax errors.")
                }
            );
        }
    };

    let user_id: Uuid = match Uuid::parse_str(&header_json.user_id) {
        Ok(id_str) => id_str,
        Err(_) => {
            debug!("Invalid UUID: {}", &header_json.user_id);
            return Err(
                ParseMessageError {
                    message: String::from("Error parsing the string provided, \
                    the 'user_id' could not be converted to a UUID. \
                    Check for syntax errors.")
                }
            );
        }
    };

    let mut header = RequestHeader {
        action: MessageAction::CreateSession,
        session_id: header_json.session_id,
        user_id,
    };

    header.action = match header_json.action.as_str() {
        "create_session" => MessageAction::CreateSession,
        "join_session" => MessageAction::JoinSession,
        _ => return Err(
            ParseMessageError {
                message: format!("Invalid action provided: {}", header_json.action)
            }
        )
    };
    Ok(header)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_message_json(user_id: Option<String>) -> RequestHeaderJson {
        let message_instance = RequestHeaderJson {
            action: String::from("create_session"),
            session_id: String::from("ECTO-1"),
            user_id: user_id.unwrap_or(String::from("683d711e-fe25-443c-8102-43d4245a6884")),
        };
        return message_instance;
    }


    fn get_message_from_json(message_instance: &RequestHeaderJson) -> Message {
        let message_instance_string = serde_json::to_string(message_instance).unwrap();
        return Message::Text(message_instance_string);
    }

    fn get_expected() -> RequestHeader {
        let expected = RequestHeader {
            action: MessageAction::CreateSession,
            session_id: String::from("ECTO-1"),
            user_id: Uuid::parse_str("683d711e-fe25-443c-8102-43d4245a6884").unwrap(),
        };
        return expected;
    }

    /// Tests the "happy path" with a valid request body
    #[test]
    fn test_parse_header() {
        let message_instance = get_message_json(None);
        let message = get_message_from_json(&message_instance);

        let expected = get_expected();
        let actual = parse_header(&message).unwrap();
        assert_eq!(expected, actual);
    }

    /// Tests that the method still works with extra keys in the JSON body
    #[test]
    fn test_parse_header_extra_keys() {
        let message_instance_string = String::from(r#"
            {
                "action": "create_session",
                "session_id": "ECTO-1",
                "user_id": "683d711e-fe25-443c-8102-43d4245a6884",
                "unrelated_key": "unused_value"
            }"#);
        let message = Message::Text(message_instance_string);

        let expected = get_expected();
        let actual = parse_header(&message).unwrap();
        assert_eq!(expected, actual);
    }


    /// Tests that we get the appropriate Error from a malformed JSON String
    #[test]
    fn test_parse_header_bad_json() {
        let message = Message::Text(String::from("{ bad json"));
        match parse_header(&message) {
            Ok(_) => assert!(false),
            Err(e) => print!("{}", e)
        }
// Pass if it reaches here
    }

    /// Tests that we get the appropriate Error from a malformed UUID for user_id
    #[test]
    fn test_parse_header_bad_user_id() {
        let message_instance = get_message_json(Some(String::from("baduuid")));
        let message = get_message_from_json(&message_instance);
        match parse_header(&message) {
            Ok(_) => assert!(false),
            Err(e) => print!("{}", e)
        }
// Pass if it reaches here
    }

    /// Tests that returning
    #[test]
    fn test_error_response_json_from_parse_message_error() {
        let parse_error_message = ParseMessageError {
            message: String::from("Test Message")
        };

        let expected = ErrorResponseJson::new(String::from("Test Message"));

        let error_response_json = ErrorResponseJson::new_from_parse_message_error(parse_error_message);
        let erj_string = to_json_string(error_response_json);
        let actual: ErrorResponseJson = match serde_json::from_str(&erj_string) {
            Ok(s) => s,
            Err(_) => {
                assert!(false);
                return;
            }
        };
        assert_eq!(expected, actual);
    }
}

