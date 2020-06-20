const SessionActions = require('../src/session-actions')

let message;

beforeEach(() => {
    message = {
        "action": "create",
        "sessionName": "testSession"
    }
})

test('createSession returns expected object', () => {
    const expected = {
        "type": "response",
        "status": "success",
        "action":"create",
        "sessionId": "a-b-c-d"
    }
    expect(SessionActions.createSession(message, {}, {})).toEqual(expected)
})

