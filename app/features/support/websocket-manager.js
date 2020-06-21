class WebsocketManager {
  constructor () {
    this.sessionId = null
    this.messageId = null
    this.globalWebsocket = null
    this.messagesReceived = {}
    this.pendingCallbacks = {}
    this.customCallbacks = {}
  }

  reset () {
    this.sessionId = null
    this.messageId = null
    if (this.globalWebsocket != null &&
      this.globalWebsocket.readyState === this.globalWebsocket.OPEN
    ) {
      this.globalWebsocket.terminate()
    }
    this.globalWebsocket = null
    this.messagesReceived = {}
    this.pendingCallbacks = {}
    this.customCallbacks = {}
  }

  setSessionId (sessionId) {
    this.sessionId = sessionId
  }

  getSessionId () {
    return this.sessionId
  }

  setMessageId (messageId) {
    this.messageId = messageId
  }

  getMessageId () {
    return this.messageId
  }

  handleMessage (data) {
    console.log('<<-- Test message received: ', data)
    const message = JSON.parse(data)
    wsManager.addMessage(message)
    if ('messageId' in message) {
      if (message.messageId in this.customCallbacks) {
        const customCallback = this.customCallbacks[message.messageId]
        customCallback(message)
      }
      if (message.messageId in this.pendingCallbacks) {
        const callback = this.pendingCallbacks[message.messageId]
        delete this.pendingCallbacks[message.messageId]
        callback()
      }
    }
  }

  saveWebsocket (websocket) {
    this.globalWebsocket = websocket
    websocket.on('message', (data) => {
      this.handleMessage(data)
    })
  }

  deferCallback (messageId, callback) {
    this.pendingCallbacks[messageId] = callback
  }

  attachCustomCallback (messageId, callback) {
    this.customCallbacks[messageId] = callback
  }

  closeWebsocket () {
    this.globalWebsocket.terminate()
  }

  getWebsocket () {
    return this.globalWebsocket
  }

  addMessage (message) {
    this.messagesReceived[message.messageId] = message
  }

  getCurrentMessage () {
    return this.messagesReceived[this.messageId]
  }

}

const wsManager = new WebsocketManager() // Makes this a singleton, I think

module.exports = wsManager
