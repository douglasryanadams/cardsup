use serde::Serialize;
use core::fmt;
use log::{warn};
pub mod headers;
pub mod create_session;
pub mod error_response;
pub mod join_session;

pub fn to_json_string<T: Serialize>(thing: T) -> String {
    return match serde_json::to_string(&thing) {
        Ok(s) => s,
        Err(error) => {
            warn!("Failed to convert Object into a JSON String.");
            String::from("[Server Error - 500:001]")
        }
    };
}

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

#[derive(Debug)]
pub(crate) struct ParseMessageError {
    message: String,
}

impl fmt::Display for ParseMessageError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "message=<{}>;", self.message)
    }
}

