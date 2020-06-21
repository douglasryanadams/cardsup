class WebsocketManager{
  constructor () {
    this.self = null
    this.sessionId = null
    this.globalWebsocket = null
    this.messagesReceived = []
  }

  createSession (sessionId) {
    this.sessionId = sessionId
  }

  destroySession () {
    this.sessionId = null
  }

  getSessionId () {
    return this.sessionId
  }

  saveWebsocket (websocket) {
    this.globalWebsocket = websocket
    this.globalWebsocket.on('message', (data) => {
      this.messagesReceived.push(JSON.parse(data))
    })
  }

  closeWebsocket () {
    this.globalWebsocket.close()
  }

  getWebsocket () {
    return this.globalWebsocket
  }

  getWebsocketMessages () {
    return this.messagesReceived
  }
}

const wsManager = new WebsocketManager()

module.exports = wsManager
