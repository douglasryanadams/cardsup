const WebSocket = require('ws')
const log = require('./logger')
const createSession = require('./session-actions/create-session')
const joinSession = require('./session-actions/join-session')
const Broadcast = require('./broadcast')
const stringify = JSON.stringify

log.info('Starting cardsup.io server!')

const websocketServer = new WebSocket.Server({
  port: 3012
}, () => {
  log.info('  server started: 0.0.0.0:3012')
})

const activeSessions = {}
const adminPanels = []

websocketServer.on('connection', (websocket, request) => {
  log.info('--> new connection from: %s', request.socket.remoteAddress)
  websocket.on('message', (message) => {
    let response = {
      type: 'response'
    }
    let msg
    try {
      msg = JSON.parse(message)
    } catch {
      response.status = 'userError'
      response.message = 'Could not parse message, please ensure it conforms to JSON format requirements.'
      websocket.send(stringify(response))
      return
    }

    if (!('messageId' in msg)) {
      response.status = 'userError'
      response.message = 'missing key, expected \'messageId\''
      websocket.send(stringify(response))
      return
    }
    response.messageId = msg.messageId
    log.info('--> message received: %s', msg.messageId)
    if (!('action' in msg)) {
      response.status = 'userError'
      response.message = 'missing key, expected \'action\''
      websocket.send(stringify(response))
      return
    }
    response.action = msg.action
    log.debug('  message action: %s', msg.action)

    if (msg.action === 'createSession') {
      response = createSession(msg, activeSessions, websocket)
      Broadcast.broadcastToAdminPanel(activeSessions, adminPanels)
    } else if (msg.action === 'joinSession') {
      response = joinSession(msg, activeSessions, websocket)
      if (response.status === 'success') {
        Broadcast.broadcastUserList(activeSessions[msg.sessionId])
        Broadcast.broadcastToAdminPanel(activeSessions, adminPanels)
      }
    } else if (msg.action === '__subscribeAsAdminPanel') {
      adminPanels.push(websocket)
      Broadcast.broadcastToAdminPanel(activeSessions, adminPanels)
      return // No response needed
    } else {
      response.status = 'userError'
      response.message = 'invalid action provided, valid actions: [createSession, joinSession]'
    }
    websocket.send(stringify(response))
  })
  websocket.on('close', () => {
    log.info('--> connection closed')
  })
})
