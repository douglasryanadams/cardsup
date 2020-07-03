const pendingMessages = {}

function validResponse (message) {
  if (!('messageId' in message)) {
    errorList.addError(ERRORS.missingMessageId())
    return false
  }
  if (!(message.messageId in pendingMessages)) {
    errorList.addError(ERRORS.notMyMessage())
    return false
  }
  if (!('status' in message) && message.status !== 'success') {
    errorList.addError(ERRORS.userError(message))
    return false
  }
  return true
}

function scrumMasterMessageHandler (message) {
  console.debug('  <-- scrumMasterMessageHandler(', message, ')')
  if (message.type === 'response') {
    if (message.action === 'createSession') onCreateSessionResponse(message)
    else errorList.addError(ERRORS.unknownAction(message))
  } else if (message.type === 'broadcast') {

  } else errorList.addError(ERRORS.unknownType(message))
  console.log('errorList=', errorList)
  console.log('pendingMessages=', pendingMessages)
  runRenderLoop()
}

function estimateMessageHandler (message) {
  console.debug('  <-- estimateMessageHandler(', message, ')')
  throw new Error('[estimateMessageHandler] is not implemented')
}

function messageSender (message) {
  console.debug('   -->', message);
  pendingMessages[message.messageId] = message
  socket.send(JSON.stringify(message));
  console.log('pendingMessages=', pendingMessages)
}

function onCreateSessionResponse (message) {
  if (validResponse(message)) {
    session.setSessionId(message.sessionId)
  }
  delete pendingMessages[message.messageId]
}
