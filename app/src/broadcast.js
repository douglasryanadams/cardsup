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
  const prunedSessions = []
  for (const [id, session] of Object.entries(activeSessions)) {
    const newSession = {
      id: id,
      name: session.name,
      users: []
    }
    for (const user of session.users) {
      newSession.users.push({
        id: user.id,
        name: user.name
      })
    }
    prunedSessions.push(newSession)
  }
  prunedSessions.sort((a, b) => a - b)

  const closedSockets = []
  for (let i = 0; i < adminPanels.length; i++) {
    const socket = adminPanels[i]
    if (socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED) {
      closedSockets.push(i)
      continue
    }
    socket.send(JSON.stringify({
      type: 'broadcast',
      activeSessions: prunedSessions,
      // This will be inaccurate the first time a socket's closed because it/they have not been removed yet
      adminCount: adminPanels.length
    }))
  }

  // Clean up closed sockets
  for (let i = closedSockets.length - 1; i >= 0; i--) {
    adminPanels.splice(closedSockets[i], 1)
  }
}

module.exports = {
  broadcastUserList,
  broadcastToAdminPanel
}
