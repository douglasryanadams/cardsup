const pendingMessages = {}

function validMessageId (message) {
  if (!('messageId' in message)) {
    console.warn('Message received without messageId:', message)
    errorList.addError(ERRORS.missingMessageId)
    return false
  }
  if (!(message.messageId in pendingMessages)) {
    console.warn('Received a message response that does not belong to me!')
    errorList.addError(ERRORS.notMyMessage)
    return false
  }
  return true
}


function scrumMasterMessageHandler (message) {
  console.debug('  <-- scrumMasterMessageHandler(', message, ')')
}

function estimateMessageHandler (message) {
  console.debug('  <-- estimateMessageHandler(', message, ')')
  throw new Error('[estimateMessageHandler] is unimplemented')
}

function messageSender (message) {
  console.debug('   -->', message);
  socket.send(JSON.stringify(message));
}

function onCreateSessionResponse (message) {
  if (!validMessageId(message)) {

  }
  session.sessionId = message.sessionId
  delete pendingMessages[message.messageId]
}