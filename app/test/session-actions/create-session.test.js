const createSession = require('../../src/session-actions/create-session')

let createSessionMessage
let fakeActiveSessions
let fakeWebsocket

beforeEach(() => {
  createSessionMessage = {
    action: 'create',
    sessionName: 'testSession'
  }
  // This doesn't actually need to be a mock websocket so it's
  // just set to something to use for comparisons
  fakeWebsocket = {
    id: 2222
  }

  fakeActiveSessions = {}
})

test('createSession returns expected object', () => {
  expect(createSession(createSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
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
  expect(createSession(createSessionMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    status: 'userError',
    action: 'createSession',
    message: "missing key, expected 'sessionName'"
  })
})
