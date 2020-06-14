use crate::messages;
use crate::messages::ParseMessageError;
use crate::messages::headers::RequestHeader;
use tungstenite::Message;
use serde::{Serialize, Deserialize};
use crate::user::User;

#[derive(Debug, PartialEq)]
pub(crate) struct CreateSessionMessage {
    pub(crate) header: RequestHeader,
    pub(crate) session_name: String,
    pub(crate) owner_name: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
struct CreateSessionMessageJson {
    // No need to parse 'header' again here
    session_name: String,
    owner_name: String,
}

/// Parse Create Session Message
pub(crate) fn parse_create_session(message: &Message, request_header: RequestHeader) -> Result<CreateSessionMessage, ParseMessageError> {
    let message_string = message.to_string();
    let create_session: CreateSessionMessageJson = match serde_json::from_str(&message_string) {
        Ok(j) => j,
        Err(error) => return Err(messages::error_response::get_parse_error(&message_string, error))
    };
    return Ok(CreateSessionMessage {
        header: request_header,
        session_name: create_session.session_name,
        owner_name: create_session.owner_name,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::messages::MessageAction;
    use uuid::Uuid;

    fn get_create_session_json() -> CreateSessionMessageJson {
        return CreateSessionMessageJson {
            session_name: String::from("Test Session Name"),
            owner_name: String::from("test_name"),
        };
    }

    fn get_create_session_json_message(message_instance: &CreateSessionMessageJson) -> Message {
        let message_instance_string = serde_json::to_string(message_instance).unwrap();
        return Message::Text(message_instance_string);
    }

    fn get_expected_create_session() -> CreateSessionMessage {
        let expected = CreateSessionMessage {
            header: RequestHeader::new(
                MessageAction::CreateSession,
                String::from("ECTO-1"),
                Uuid::parse_str("683d711e-fe25-443c-8102-43d4245a6884").unwrap(),
            )
            ,
            session_name: String::from("Test Session Name"),
            owner_name: String::from("test_name"),
        };
        return expected;
    }

    /// Tests that we correctly parse a create message
    #[test]
    fn test_create_session() {
        let message_instance = get_create_session_json();
        let message = get_create_session_json_message(&message_instance);

        let header = get_expected_create_session().header;
        let expected = get_expected_create_session();
        let actual = parse_create_session(&message, header).unwrap();
        assert_eq!(expected, actual);
    }
}