const joinSession = require('../../src/session-actions/join-session')

let joinSessionMessage
let fakeActiveSessions
let fakeWebsocket

beforeEach(() => {
  joinSessionMessage = {
    sessionId: 'a-b-c-d',
    username: 'testUsername'
  }
  // This doesn't actually need to be a mock websocket so it's
  // just set to something to use for comparisons
  fakeWebsocket = {
    id: 2222
  }

  fakeActiveSessions = {
    'a-b-c-d': {
      id: 'a-b-c-d',
      name: 'testSession',
      users: [{
        id: 'a-b-c-d',
        name: 'testSession-Owner',
        sessionId: 'a-b-c-d',
        websocket: {
          id: 1111
        }
      }]
    }
  }

})

test('joinSession returns expected object', () => {
  expect(joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    status: 'success',
    action: 'joinSession',
    allUsers: [
      {
        id: 'a-b-c-d',
        name: 'testSession-Owner',
        sessionId: 'a-b-c-d',
        websocket: {
          id: 1111
        }
      },
      {
        id: 'a-b-c-d',
        name: 'testUsername',
        sessionId: 'a-b-c-d',
        websocket: fakeWebsocket
      }
    ]
  })
  expect(fakeActiveSessions).toEqual({
    'a-b-c-d': {
      id: 'a-b-c-d',
      name: 'testSession',
      users: [
        {
          id: 'a-b-c-d',
          name: 'testSession-Owner',
          sessionId: 'a-b-c-d',
          websocket: {
            id: 1111
          }
        },
        {
          id: 'a-b-c-d',
          name: 'testUsername',
          sessionId: 'a-b-c-d',
          websocket: fakeWebsocket
        }
      ]
    }
  })
})

test("joinSession returns error if 'username' is missing", () => {
  delete joinSessionMessage.username
  expect(joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "missing key, expected 'username'"
  })
})

test("joinSession returns error if 'sessionId' is missing", () => {
  delete joinSessionMessage.sessionId
  expect(joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "missing key, expected 'sessionId'"
  })
})

test("joinSession returns error if 'sessionId' doesn't exist", () => {
  joinSessionMessage.sessionId = 'z-y-x-w'
  expect(joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "invalid 'sessionId'"
  })
})
