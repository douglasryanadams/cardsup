const uuid = require('uuid')
const log = require('./../logger')

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
    name: `${message.sessionName}-Owner`,
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

module.exports = createSession