const fs = require('fs-extra');
const { promisify } = require('util');
const net = require('net');

async function isSocketInUse(socketPath) {
  return new Promise((resolve, reject) => {
    const clientSocket = new net.Socket();
    clientSocket.on('error', e => {
      if (e.code === 'ECONNREFUSED') {
        resolve(false);
      } else {
        reject(e);
      }
    });
    clientSocket.connect(
      { path: socketPath },
      () => {
        clientSocket.unref();
        resolve(true);
      },
    );
  });
}

export default async function startServer(server, listenLocation) {
  try {
    await promisify(server.start)(listenLocation);
  } catch (e) {
    if (e.code !== 'EADDRINUSE') {
      throw e;
    }
    if (await isSocketInUse(listenLocation)) {
      throw e;
    }
    await fs.unlink(listenLocation);
    await promisify(server.start)(listenLocation);
  }
}
