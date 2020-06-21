const WebSocket = require('ws')
const { Before, After } = require('cucumber')
const wsManager = require('./websocket-manager')

Before((scenario, callback) => {
  wsManager.saveWebsocket(new WebSocket('ws://localhost:3012', 'ws', {}))
  callback()
})

After((scenario, callback) => {
  wsManager.closeWebsocket()
  callback()
})
