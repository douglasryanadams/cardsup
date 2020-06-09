use crate::messages::ParseMessageError;
use crate::messages::headers::ResponseHeaderJson;
use core::fmt;
use serde::{Serialize, Deserialize};
use log::{debug};


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
            header: ResponseHeaderJson::new(
                String::from("response"),
                400,
                String::from("bad_request"),
            ),
            message: error_message,
        };
    }

    pub(crate) fn new_from_parse_message_error(parse_message_error: ParseMessageError) -> ErrorResponseJson {
        return ErrorResponseJson::new(parse_message_error.message);
    }
}

pub(crate) fn get_parse_error(message_string: &String, error: serde_json::Error) -> ParseMessageError {
    debug!("Invalid JSON Format: {}", &message_string);
    return ParseMessageError {
        message: format!("Error parsing the string provided \
                    into expected JSON Object. \
                    Raw message: <{}>", error)
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::messages::to_json_string;

    /// Tests that returning an error is formatted properly
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
