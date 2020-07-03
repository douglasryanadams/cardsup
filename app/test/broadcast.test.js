const Broadcast = require('../src/broadcast')

let fakeSession
let fakeActiveSessions
let fakeAdminPanels

beforeEach(() => {
  fakeSession = {
    id: 'a-b-c-d',
    name: 'testSession',
    users: [
      {
        id: 'a-b-c-d',
        name: 'testUserNameOne',
        sessionId: 'a-b-c-d',
        websocket: {
          send: jest.fn()
        }
      },
      {
        id: 'e-f-g-h',
        name: 'testUserNameTwo',
        sessionId: 'a-b-c-d',
        websocket: {
          send: jest.fn()
        }
      }
    ]
  }

  fakeActiveSessions = {
    'a-b-c-d': {
      id: 'a-b-c-d',
      name: 'testSessionOne',
      users: [{
        id: 1,
        name: 'testUserNameOne'
      }, {
        id: 2,
        name: 'testUserNameTwo'
      }]
    },
    'e-f-g-h': {
      id: 'e-f-g-h',
      name: 'testSessionTwo',
      users: [{
        id: 3,
        name: 'testUserNameThree'
      }, {
        id: 4,
        name: 'testUserNameFour'
      }]
    }
  }

  fakeAdminPanels = [
    {
      id: 'for-test-001',
      readyState: 2,
      CLOSING: 4,
      CLOSED: 5,
      send: jest.fn()
    },
    {
      id: 'for-test-002',
      readyState: 2,
      CLOSING: 4,
      CLOSED: 5,
      send: jest.fn()
    },
    {
      id: 'for-test-003',
      readyState: 5,
      CLOSING: 4,
      CLOSED: 5,
      send: jest.fn()
    }
  ]
})

test('broadcastUserList sends the expected messages', () => {
  // There's some risk to stringifying this because order's not guaranteed
  const expectedMessage = JSON.stringify({
    type: 'broadcast',
    action: 'updateUserList',
    allUsers: [{
      id: 'a-b-c-d',
      name: 'testUserNameOne',
      sessionId: 'a-b-c-d'
    }, {
      id: 'e-f-g-h',
      name: 'testUserNameTwo',
      sessionId: 'a-b-c-d'
    }]
  })

  Broadcast.broadcastUserList(fakeSession)
  expect(fakeSession.users[0].websocket.send).toHaveBeenCalledWith(expectedMessage)
  expect(fakeSession.users[1].websocket.send).toHaveBeenCalledWith(expectedMessage)
})

test('', () => {
  // As above, some risk of stringify ordering causing issues here
  const expectedMessage = JSON.stringify({
    type: 'broadcast',
    activeSessions: [
      {
        id: 'a-b-c-d',
        name: 'testSessionOne',
        users: [{
          id: 1,
          name: 'testUserNameOne'
        }, {
          id: 2,
          name: 'testUserNameTwo'
        }]
      },
      {
        id: 'e-f-g-h',
        name: 'testSessionTwo',
        users: [{
          id: 3,
          name: 'testUserNameThree'
        }, {
          id: 4,
          name: 'testUserNameFour'
        }]
      }
    ],
    adminCount: 2
  })

  const closedAdminPanel = fakeAdminPanels[2] // Save this first so it's available to check
  Broadcast.broadcastToAdminPanel(fakeActiveSessions, fakeAdminPanels)
  expect(fakeAdminPanels[0].send).toHaveBeenCalledWith(expectedMessage)
  expect(fakeAdminPanels[1].send).toHaveBeenCalledWith(expectedMessage)
  expect(closedAdminPanel.send).not.toHaveBeenCalled()
  expect(fakeAdminPanels).toEqual([fakeAdminPanels[0], fakeAdminPanels[1]])
})
