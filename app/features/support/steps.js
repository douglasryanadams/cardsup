const { Given, When, Then } = require('cucumber')
const WebSocket = require('ws')
const wsManager = require('./websocket-manager')

Given('My session does not exist yet', () => {
  if (this.sessionId != null) {
    this.sessionId = null
  }
})

Given('A session exists', (callback) => {
  if (this.sessionId == null) {
    const ws = wsManager.getWebsocket()
    ws.on('connection', () => {
      ws.send({
        action: 'createSession',
        sessionName: 'cucumberSession'
      })
      callback()
    })
  }
})

When('I create a new session', (callback) => {
  console.log(this)
  const ws = wsManager.getWebsocket()
  ws.on('connection', () => {
    ws.send({
      action: 'createSession',
      sessionName: 'cucumberSession'
    })
    callback()
  })
})

When('I join that session', () => {
  const ws = wsManager.getWebsocket()
  ws.send({
    action: 'joinSession',
    sessionId: this.sessionId,
    username: 'cucumberUser'
  })
})

When('Another user joins that session', () => {
  const newWs = new WebSocket('ws://localhost:3012', 'ws', {})
  newWs.send({
    action: 'joinSession',
    sessionId: this.sessionId,
    username: 'anotherCucumberUser'
  })
  newWs.terminate()
})

Then('I receive a response with status: {string}', (status) => {
  const messages = wsManager.getWebsocketMessages()
  let i = 0
  while (i < messages.length) {
    if (messages[i].status === status) break
    i++
  }
  if (i === messages.length) throw new Error(`no 'success' status received: ${messages}`)
  messages.splice(i, 1)
})

Then('I receive a list of {int} users', (userCount) => {
  const messages = wsManager.getWebsocketMessages()
  let i = 0
  while (i < messages.length) {
    const message = messages[i]
    if (message.type === 'broadcast' && message.action === 'updateUserList') break
    i++
  }
  if (i === messages.length) throw new Error(`no successful 'updateUserList' broadcast found: ${messages}`)
  const users = messages[i].allUsers
  messages.splice(i, 1)
  if (users.length !== userCount) {
    throw new Error(`Expected user count <${userCount}> did not equal actual user count <%{users.length}>`)
  }
})
