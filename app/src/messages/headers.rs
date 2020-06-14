use crate::messages;
use crate::messages::{MessageAction, ParseMessageError};
use serde::{Serialize, Deserialize};
use log::{debug};
use core::fmt;
use tungstenite::Message;
use uuid::Uuid;

#[derive(Debug, PartialEq)]
pub(crate) struct RequestHeader {
    pub(crate) action: MessageAction,
    pub(crate) session_id: String,
    pub(crate) from_user_id: uuid::Uuid,
}

impl RequestHeader {
    pub(crate) fn new(action: MessageAction, session_id: String, from_user_id: uuid::Uuid) -> RequestHeader {
        return RequestHeader {
            action,
            session_id,
            from_user_id,
        };
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct RequestHeaderJson {
    action: String,
    session_id: String,
    from_user_id: String,
}

impl fmt::Display for RequestHeaderJson {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "action=<{}>;session_id=<{}>;user_id=<{}>;", self.action, self.session_id, self.from_user_id)
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct GenericRequestWrapperJson {
    header: RequestHeaderJson
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub(crate) struct ResponseHeaderJson {
    message_type: String,
    status_code: u16,
    status: String,
}

impl ResponseHeaderJson {
    pub(crate) fn new(message_type: String, status_code: u16, status: String) -> ResponseHeaderJson {
        return ResponseHeaderJson {
            message_type,
            status_code,
            status,
        };
    }
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

/// Takes the websocket message body and extracts the header from the message
///
/// Personal Note: This is on of my first implementations of a Rust method.
pub(crate) fn parse_header(message: &Message) -> Result<RequestHeader, ParseMessageError> {
    let message_string = message.to_string();
    let wrapper: GenericRequestWrapperJson = match serde_json::from_str(&message_string) {
        Ok(j) => j,
        Err(error) => return Err(messages::error_response::get_parse_error(&message_string, error))
    };

    let header_json = wrapper.header;

    let user_id: Uuid = match Uuid::parse_str(&header_json.from_user_id) {
        Ok(id_str) => id_str,
        Err(_) => {
            debug!("Invalid UUID: {}", &header_json.from_user_id);
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
        from_user_id: user_id,
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

    fn get_header_json(user_id: Option<String>) -> GenericRequestWrapperJson {
        return GenericRequestWrapperJson {
            header: RequestHeaderJson {
                action: String::from("create_session"),
                session_id: String::from("ECTO-1"),
                from_user_id: user_id.unwrap_or(String::from("683d711e-fe25-443c-8102-43d4245a6884")),
            }
        };
    }

    fn get_expected_request_header() -> RequestHeader {
        let expected = RequestHeader::new(
            MessageAction::CreateSession,
            String::from("ECTO-1"),
            Uuid::parse_str("683d711e-fe25-443c-8102-43d4245a6884").unwrap(),
        );
        return expected;
    }

    fn get_header_json_message(message_instance: &GenericRequestWrapperJson) -> Message {
        let message_instance_string = serde_json::to_string(message_instance).unwrap();
        return Message::Text(message_instance_string);
    }

    /// Tests the "happy path" with a valid request body
    #[test]
    fn test_parse_header() {
        let message_instance = get_header_json(None);
        let message = get_header_json_message(&message_instance);

        let expected = get_expected_request_header();
        let actual = parse_header(&message).unwrap();
        assert_eq!(expected, actual);
    }

    /// Tests that the method still works with extra keys in the JSON body
    #[test]
    fn test_parse_header_extra_keys() {
        let message_instance_string = String::from(r#"
            {
                "header" : {
                    "action": "create_session",
                    "session_id": "ECTO-1",
                    "user_id": "683d711e-fe25-443c-8102-43d4245a6884",
                    "unrelated_key": "unused_value"
                }
            }"#);
        let message = Message::Text(message_instance_string);

        let expected = get_expected_request_header();
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
    }

    /// Tests that we get the appropriate Error from a malformed UUID for user_id
    #[test]
    fn test_parse_header_bad_user_id() {
        let message_instance = get_header_json(Some(String::from("baduuid")));
        let message = get_header_json_message(&message_instance);
        match parse_header(&message) {
            Ok(_) => assert!(false),
            Err(e) => print!("{}", e)
        }
    }
}
