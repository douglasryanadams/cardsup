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

module.exports = {broadcastUserList}
