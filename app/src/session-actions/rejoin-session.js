const log = require('./../logger')

function rejoinSessionAsOwner (message, activeSessions, websocket) {
  log.info('--> rejoin session as owner')
  const response = {
    type: 'response',
    messageId: message.messageId,
    action: 'rejoinSessionAsOwner'
  }
  if (!('sessionId' in message)) {
    response.status = 'userError'
    response.message = 'missing key, expected \'sessionId\''
    return response
  }
  const session = activeSessions[message.sessionId]
  session.users[0].websocket = websocket

  response.status = 'success'
  return response
}

function rejoinSessionAsContributor () {
  throw new Error('[rejoinSessionAsContributor] is not implemented')
}

module.exports = {
  rejoinSessionAsOwner,
  rejoinSessionAsContributor
}
