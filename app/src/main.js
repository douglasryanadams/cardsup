const WebSocket = require('ws')
const log = require('./logger')
const SessionActions = require('./session-actions')
const Broadcast = require('./broadcast')

log.info('Starting cardsup.io server!')

const websocketServer = new WebSocket.Server({
  port: 3012
}, () => {
  log.info('  server started')
})

const activeSessions = {}

websocketServer.on('connection', (websocket) => {
  websocket.on('message', (message) => {
    const msg = JSON.parse(message)
    let response

    if (msg.action === 'create') {
      response = SessionActions.createSession(msg, activeSessions, websocket)
    } else if (msg.action === 'join') {
      response = SessionActions.joinSession(msg, activeSessions, websocket)
      if (response.status === 'success') {
        Broadcast.broadcastUserList(activeSessions.sessionId)
      }
    } else {
      response = {
        type: 'response',
        action: 'unknown',
        status: 'userError',
        message: "message 'action' either missing or invalid"
      }
    }
    websocket.send(JSON.stringify(response))
  })
})
