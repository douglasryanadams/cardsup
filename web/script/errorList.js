const ERRORS = {
  userError: (errorMessage) => new ErrorMessage(5000, `Bug discovered: ${errorMessage.message}`),
  missingMessageId: _ => new ErrorMessage(5001, 'Received message with no "messageId"!'),
  notMyMessage: _ => new ErrorMessage(5002, 'Received a response for a message I never sent!'),
  unknownAction: (message) => new ErrorMessage(5003, `Response received for an unknown action: ${message.action}`),
  unknownType: (message) => new ErrorMessage(5004, `Response received for an unknown message type: ${message.type}`),
}

function ErrorMessage (id, message) {
  this.id = id;
  this.message = message;
  this.left = null;
  this.right = null;
}

function ErrorList () {
  this.errorMessages = {}
  this.firstMessage = null;
  this.lastMessage = null;

  this.addError = function (errorMessage) {
    this.errorMessages[errorMessage.id] = errorMessage
    if (this.firstMessage === null) {
      this.firstMessage = errorMessage
      this.lastMessage = errorMessage
    } else {
      this.lastMessage.right = errorMessage
      errorMessage.left = this.lastMessage
      this.lastMessage = errorMessage
    }
  }

  this.clearError = function (messageId) {
    const message = this.errorMessages[messageId]
    if (message.left === null) { // First Message
      const messageRight = message.right
      this.firstMessage = messageRight

      if (messageRight !== null) {
        this.firstMessage.right.left = null
      }
    }

    if (message.right === null) { // Last Message
      const messageLeft = message.left
      this.lastMessage = messageLeft

      if (messageLeft !== null) {
        this.lastMessage.left.right = null
      }
    }

    if (message.left !== null && message.right !== null) { // Middle Message
      message.left.right = message.right
      message.right.left = message.left
    }

    delete this.errorMessages[messageId]
  }

  this.getFirst = function () {
    return this.firstMessage;
  }
}

const errorList = new ErrorList();

