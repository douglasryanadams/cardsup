/* eslint-disable object-curly-spacing */
const WebSocket = require('ws')
const {Before, After} = require('cucumber')
const wsManager = require('./websocket-manager')

Before((scenario, callback) => {
  wsManager.reset()
  const websocket = new WebSocket('ws://localhost:3012', 'ws', {})
  websocket.on('open', () => {
    callback()
  })
  wsManager.saveWebsocket(websocket)
})

After((scenario, callback) => {
  wsManager.getWebsocket().on('close', () => {
    callback()
  })
  wsManager.closeWebsocket()
})
