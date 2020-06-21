const log = require('./logger')

function broadcastUserList (session) {
  for (const user of session.users) {
    log.debug('  <-- sending out list of users for session: %s', session.sessionId)
    user.websocket.send(JSON.stringify({
      type: 'broadcast',
      action: 'updateUserList',
      allUsers: session.users
    }))
  }
}

module.exports = { broadcastUserList }
