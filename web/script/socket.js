const loc = window.location
let ws_url;
if (loc.protocol === "https:") {
  ws_url = "wss:";
} else {
  ws_url = "ws:";
}
ws_url += `//${loc.host}/socket/`;

const SOCKET_ADDRESS = ws_url;

console.info("Connecting to Web Socket: " + SOCKET_ADDRESS)
const socket = new WebSocket(SOCKET_ADDRESS)
