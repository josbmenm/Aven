import createNetworkSource from '../cloud-network/createNetworkSource';

const fetchFn = global.fetch && global.fetch.bind(window);

export default function createBrowserNetworkSource(opts) {
  return createNetworkSource({
    WebSocket: undefined,
    fetchFn,
    ...opts,
  });
}
