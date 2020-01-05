import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AppRegistry } from 'react-native-web';

const mainDiv = document.getElementById('main');

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  rootTag: mainDiv,
});

const metroSocket = new WebSocket('ws://localhost:8081/hot');

function metroDispatch(payload) {
  metroSocket.send(JSON.stringify(payload));
}
metroSocket.onopen = () => {
  console.log('Metro Connected.');
  metroDispatch({
    type: 'register-entrypoints',
    entryPoints: [
      'ws://localhost:8081/hot?bundleEntry=packages/something-caboose/Client.bundle',
    ],
  });
  metroDispatch({
    type: 'log-opt-in',
  });
};

metroSocket.onclose = () => {
  console.log('Metro Disconnected.');
};
let hasHadFirstUpdate = false;
metroSocket.onmessage = msg => {
  const message = JSON.parse(msg.data);
  console.log('Metro Message:', message);
  if (message.type === 'update-done') {
    if (!hasHadFirstUpdate) {
      hasHadFirstUpdate = true;
    } else {
      window.location.reload();
    }
  }
};
