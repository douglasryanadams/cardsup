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

function __getPrunedSessions (activeSessions) {
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
  return prunedSessions
}

function __removeStaleSessions (adminPanels) {
  for (let i = adminPanels.length - 1; i >= 0; i--) {
    const socket = adminPanels[i]
    if (socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED) {
      adminPanels.splice(i, 1)
    }
  }
}

function __broadcastAdminData (prunedSessions, adminPanels) {
  for (let i = 0; i < adminPanels.length; i++) {
    const socket = adminPanels[i]
    socket.send(JSON.stringify({
      type: 'broadcast',
      activeSessions: prunedSessions,
      adminCount: adminPanels.length
    }))
  }
}

function broadcastToAdminPanel (activeSessions, adminPanels) {
  log.info('  <-- broadcasting to admin panels')
  const prunedSessions = __getPrunedSessions(activeSessions)
  __removeStaleSessions(adminPanels)
  __broadcastAdminData(prunedSessions, adminPanels)
}

module.exports = {
  broadcastUserList,
  broadcastToAdminPanel
}
