const {rejoinSessionAsOwner} = require('../../src/session-actions/rejoin-session')

let fakeMessage
let fakeActiveSessions
let fakeWebsocket

beforeEach(() => {
  fakeMessage = {
    sessionId: 'e-f-g-h',
    messageId: 'a-b-c-d'
  }
  fakeActiveSessions = {
    'e-f-g-h': {
      users: [
        {
          name: 'testOwnerUsername',
          websocket: {
            placeholder: 333
          }
        },
        {}
      ]
    },
    'i-j-k-l': {}
  }
  fakeWebsocket = {
    placeholder: 111
  }
})

test('rejoinSessionAsOwner returns the correct response and makes the appropriate update', () => {
  expect(rejoinSessionAsOwner(fakeMessage, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    messageId: 'a-b-c-d',
    action: 'rejoinSessionAsOwner',
    status: 'success'
  })
  expect(fakeActiveSessions['e-f-g-h'].users[0].websocket).toEqual(fakeWebsocket)
})

test('rejoinSessionAsOwner returns an error without sessionId', () => {
  expect(rejoinSessionAsOwner({
    messageId: 'a-b-c-d'
  }, fakeActiveSessions, fakeWebsocket)).toEqual({
    type: 'response',
    messageId: 'a-b-c-d',
    action: 'rejoinSessionAsOwner',
    status: 'userError',
    message: 'missing key, expected \'sessionId\''
  })
})
