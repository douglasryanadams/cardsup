const WebSocket = require('ws')
const log = require('./logger')
const SessionActions = require('./session-actions')
const Broadcast = require("./broadcast")

log.info("Starting cardsup.io server!")

const websocketServer = new WebSocket.Server({
    port: 3012
}, () => {
    log.info("  server started")
})

const activeSessions = {}

websocketServer.on('connection', (websocket) => {
    websocket.on('message', (message) => {
        const msg = JSON.parse(message)
        let response;
        switch (msg["action"]) {
            case "create":
                response = SessionActions.createSession(msg, activeSessions, websocket);
                break
            case "join":
                const joinSession = SessionActions.joinSession(msg, activeSessions, websocket);
                response = joinSession[0]
                if (response["status"] === "success") {
                    Broadcast.broadcastUserList(activeSessions["sessionId"])
                }
                break
        }
        websocket.send(JSON.stringify(response))
    });
});