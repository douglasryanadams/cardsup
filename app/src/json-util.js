function jsonReadyUserListCopy (session) {
  const userList = []
  for (const user of session.users) {
    userList.push({
      id: user.id,
      name: user.name,
      sessionId: user.sessionId
    })
  }
  return userList
}

module.exports = {jsonReadyUserListCopy}
