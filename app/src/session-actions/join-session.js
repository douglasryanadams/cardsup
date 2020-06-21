const uuid = require('uuid')
const log = require('./../logger')
const {jsonReadyUserListCopy} = require('../json-util')

function joinSession (message, activeSessions, websocket) {
  log.info('--> joining session')
  const response = {
    type: 'response',
    messageId: message.messageId,
    action: 'joinSession'
  }

  if (!('username' in message)) {
    response.status = 'userError'
    response.message = "missing key, expected 'username'"
    return response
  }
  if (!('sessionId' in message)) {
    response.status = 'userError'
    response.message = "missing key, expected 'sessionId'"
    return response
  }
  log.debug('  joining session: %s', message.sessionId)

  const sessionId = message.sessionId
  if (!(sessionId in activeSessions)) {
    response.status = 'userError'
    response.message = "invalid 'sessionId'"
    return response
  }

  const session = activeSessions[sessionId]
  const user = {
    id: uuid.v4(),
    name: message.username,
    sessionId: sessionId,
    websocket: websocket
  }
  session.users.push(user)

  log.info('  session <%s> joined successfully', sessionId)
  response.status = 'success'
  response.allUsers = jsonReadyUserListCopy(session)
  return response
}

module.exports = joinSession
