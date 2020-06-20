const SessionActions = require('../src/session-actions')

let createSessionMessage
let joinSessionMessage
let fakeActiveSessions
let fakeWebsocket

beforeEach(() => {
  createSessionMessage = {
    action: 'create',
    sessionName: 'testSession'
  }
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

test('createSession returns expected object', () => {
  fakeActiveSessions = {}
  expect(SessionActions.createSession(createSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    status: 'success',
    action: 'createSession',
    sessionId: 'a-b-c-d'
  })
  expect(fakeActiveSessions).toEqual({
    'a-b-c-d': {
      id: 'a-b-c-d',
      name: 'testSession',
      users: [{
        id: 'a-b-c-d',
        name: 'testSession-Owner',
        sessionId: 'a-b-c-d',
        websocket: fakeWebsocket
      }]
    }
  })
})

test("createSession returns an error if 'sessionName' is missing", () => {
  delete createSessionMessage.sessionName
  expect(SessionActions.createSession(createSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    status: 'userError',
    action: 'createSession',
    message: "missing key, expected 'sessionName'"
  })
})

test('joinSession returns expected object', () => {
  expect(SessionActions.joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
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
  expect(SessionActions.joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "missing key, expected 'username'"
  })
})

test("joinSession returns error if 'sessionId' is missing", () => {
  delete joinSessionMessage.sessionId
  expect(SessionActions.joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "missing key, expected 'sessionId'"
  })
})

test("joinSession returns error if 'sessionId' doesn't exist", () => {
  joinSessionMessage.sessionId = 'z-y-x-w'
  expect(SessionActions.joinSession(joinSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    action: 'joinSession',
    status: 'userError',
    message: "invalid 'sessionId'"
  })
})
