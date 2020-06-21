const {Given, When, Then} = require('cucumber')
const WebSocket = require('ws')
const wsManager = require('./websocket-manager')
const stringify = JSON.stringify
const parse = JSON.parse
const uuid = require('uuid')

Given('My session does not exist yet', () => {
  if (this.sessionId != null) {
    this.sessionId = null
  }
})

function createSession (callback) {
  const messageId = uuid.v4()
  const ws = wsManager.getWebsocket()
  wsManager.setMessageId(messageId)
  wsManager.deferCallback(messageId, callback)
  wsManager.attachCustomCallback(messageId, (message) => {
    wsManager.setSessionId(message.sessionId)
  })
  ws.send(stringify({
    messageId: messageId,
    action: 'createSession',
    sessionName: 'cucumberSession'
  }))
}

Given('A session exists', (callback) => {
  if (this.sessionId == null) {
    createSession(callback)
  }
})

When('I create a new session', (callback) => {
  createSession(callback)
})

When('I join that session', (callback) => {
  const messageId = uuid.v4()
  const ws = wsManager.getWebsocket()
  wsManager.setMessageId(messageId)
  wsManager.deferCallback(messageId, callback)
  ws.send(stringify({
    messageId: messageId,
    action: 'joinSession',
    sessionId: wsManager.getSessionId(),
    username: 'cucumberUser'
  }))
})

When('Another user joins that session', (callback) => {
  const messageId = uuid.v4()
  const newWebsocket = new WebSocket('ws://localhost:3012', 'ws', {})
  wsManager.setMessageId(messageId)
  wsManager.deferCallback(messageId, callback)
  newWebsocket.on('message', (data) => {
    wsManager.handleMessage(data)
    newWebsocket.terminate()
  })
  newWebsocket.on('open', () => {
    newWebsocket.send(stringify({
      messageId: messageId,
      action: 'joinSession',
      sessionId: wsManager.getSessionId(),
      username: 'anotherCucumberUser'
    }))
  })
})

Then('I receive a response with status: {string}', (status) => {
  const message = wsManager.getCurrentMessage()
  if (message.status !== status) {
    throw new Error(`response was <${message.status}> but expected <${status}>, full message: <${stringify(message)}>`)
  }
})

Then('I receive a list of {int} users', (userCount) => {
  const message = wsManager.getCurrentMessage()
  if (message.allUsers.length !== userCount) {
    throw new Error(`response included ${message.users.length} users but expected ${userCount}`)
  }
})
