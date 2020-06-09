use crate::messages::headers::RequestHeader;

#[derive(Debug, PartialEq)]
pub(crate) struct JoinSessionMessage {
    header: RequestHeader,
    session_id: uuid::Uuid,
    user_name: String,
}

