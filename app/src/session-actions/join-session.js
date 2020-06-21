const uuid = require('uuid')
const log = require('./../logger')

function joinSession (message, activeSessions, websocket) {
  log.info('--> joining session')
  const response = {
    type: 'response',
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
  response.allUsers = session.users
  return response
}

module.exports = joinSession
