const uuid = require('uuid')
const log = require('./logger')

function createSession(message, activeSessions, websocket) {
  log.info('--> create session')
  const sessionId = uuid.v4()
  const response = {
    type: 'response',
    action: 'createSession'
  }
  log.debug('  creating session: %s', sessionId)
  if (!('sessionName' in message)) {
    response.status = 'userError'
    response.message = "missing key, expected 'sessionName'"
    return response
  }
  const owner = {
    id: uuid.v4(),
    name: `${message.sessionName}-Owner`, // TODO: Unit test for missing name
    sessionId: sessionId,
    websocket: websocket
  }
  activeSessions[sessionId] = {
    id: sessionId,
    name: message.sessionName,
    users: [owner]
  }

  log.info('<-- session created successfully')
  response.status = 'success'
  response.sessionId = sessionId
  return response
}

function joinSession(message, activeSessions, websocket) {
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
  response.status = 'success'
  response.allUsers = session.users
  return response
}

module.exports = {createSession, joinSession}
