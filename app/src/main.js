const WebSocket = require('ws')
const log = require('./logger')
const createSession = require('./session-actions/create-session')
const joinSession = require('./session-actions/join-session')
const Broadcast = require('./broadcast')

log.info('Starting cardsup.io server!')

const websocketServer = new WebSocket.Server({
  port: 3012
}, () => {
  log.info('  server started')
})

const activeSessions = {}

websocketServer.on('connection', (websocket, request) => {
  log.info('--> new connection from: %s', request.socket.remoteAddress)
  websocket.on('message', (message) => {
    const msg = JSON.parse(message)
    let response

    if (msg.action === 'create') {
      response = createSession(msg, activeSessions, websocket)
    } else if (msg.action === 'join') {
      response = joinSession(msg, activeSessions, websocket)
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
  websocket.on('close', () => {
    log.info('--> connection closed')
  })
})
