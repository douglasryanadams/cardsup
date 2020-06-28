const log = require('./logger')
const {jsonReadyUserListCopy} = require('./json-util')

function broadcastUserList (session) {
  const userList = jsonReadyUserListCopy(session)
  for (const user of session.users) {
    log.debug('  <-- sending out list of users for session: <%s> (%s) to: <%s> (%s)', session.id, session.name, user.id, user.name)
    user.websocket.send(JSON.stringify({
      type: 'broadcast',
      action: 'updateUserList',
      allUsers: userList
    }))
  }
}

function broadcastToAdminPanel (activeSessions, adminPanels) {
  log.info('  <-- broadcasting to admin panels')
  const closedSockets = []
  for (let i = 0; i < adminPanels.length; i++) {
    const socket = adminPanels[i]
    if (socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED) {
      closedSockets.push(i)
      continue
    }
    socket.send(JSON.stringify({
      type: 'broadcast',
      activeSessions: activeSessions,
      adminCount: adminPanels.length
    }))
  }
  for (let i = closedSockets.length - 1; i >= 0; i--) {
    closedSockets.splice(i, 1)
  }
}

module.exports = {
  broadcastUserList,
  broadcastToAdminPanel
}
