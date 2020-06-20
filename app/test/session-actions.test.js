const SessionActions = require('../src/session-actions')

let createSessionMessage
let joinSessionMessage
let fakeActiveSessions
let mockWebsocket

beforeEach(() => {
  createSessionMessage = {
    action: 'create',
    sessionName: 'testSession'
  }
  joinSessionMessage = {
    sessionId: 'a-b-c-d',
    username: 'testUsername'
  }
  fakeActiveSessions = {}
  mockWebsocket = jest.mock()
})

test('createSession returns expected object', () => {
  expect(SessionActions.createSession(createSessionMessage, fakeActiveSessions, mockWebsocket)).toEqual({
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
        websocket: mockWebsocket
      }]
    }
  })
})

test("createSession returns an error if 'sessionName' is missing", () => {
  delete createSessionMessage.sessionName
  expect(SessionActions.createSession(createSessionMessage, fakeActiveSessions, mockWebsocket)).toEqual({
    type: 'response',
    status: 'userError',
    action: 'createSession',
    message: "missing key, expected 'sessionName'"
  })
})

test('joinSession returns expected object', () => {

})

test("joinSession returns error if 'username' is missing", () => {

})

test("joinSession returns error if 'sessionId' is missing", () => {

})
