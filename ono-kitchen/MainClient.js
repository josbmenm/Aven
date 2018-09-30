import App from './App';

import startWebClient from '../aven-web/WebClient';

import ReconnectingWebSocket from 'reconnecting-websocket';

console.log('WOAH', process.env.NODE_ENV);
const rws = new ReconnectingWebSocket('ws://localhost:3000', [], {
  // WebSocket: WS,
});

rws.addEventListener('open', () => {
  const msg = { type: 'hello', value: 'world' };
  rws.send(JSON.stringify(msg));
});

rws.addEventListener('message', a => {
  console.log('data!', a);
});

export default function startClient() {
  startWebClient(App);
}
