import { Container } from 'unstated';
import uuid from 'uuid/v1';
import ReconnectingWebSocket from 'reconnecting-websocket';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Truck extends Container {
  constructor() {
    super();

    this._ws = new ReconnectingWebSocket('ws://smoothiepi:8080', [], {
      // debug: true,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      minUptime: 5000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4000,
      maxRetries: Infinity,
    });

    setInterval(() => {
      // wow, the shame of an interval! please don't be inspired by this..
      if (this._ws.readyState === ReconnectingWebSocket.CLOSED) {
        this._ws.reconnect(47, 'you hung up on me!');
      }
      const isConnected = this._ws.readyState === ReconnectingWebSocket.OPEN;
      if (this.state.isConnected !== isConnected) {
        this.setState(last => ({ ...last, isConnected }));
      }
    }, 500);

    this._wsClientId = null;
    this._ws.onopen = () => {
      console.log('Connected to Truck!');
    };
    this._ws.onmessage = msg => {
      const evt = JSON.parse(msg.data);
      switch (evt.type) {
        case 'ClientId': {
          this._wsClientId = evt.clientId;
          console.log('ClientId', this._wsClientId);
          return;
        }
        case 'OrderStatus': {
          this.setState(state => ({
            orders: {
              ...state.orders,
              [evt.orderId]: evt.order,
            },
          }));
        }
        default: {
          console.log(evt);
          return;
        }
      }
    };
  }
  remoteAction = action => {
    this._ws && this._ws.send(JSON.stringify(action));
  };
  state = {
    orders: {},
    isConnected: false,
  };
  async sendFeedback(orderId, rating, comments, email) {
    this.remoteAction({
      type: 'SendFeedback',
      orderId,
      order: this.state.orders[orderId],
      rating,
      comments,
      email,
    });
  }
  async makeOrder(orderDetails) {
    const orderId = uuid();
    this.remoteAction({ type: 'OrderProduct', orderId, ...orderDetails });
    const order = {
      ...orderDetails,
      creationTime: new Date(),
      orderId,
    };
    await this.setState(state => ({
      orders: { ...state.orders, [orderId]: order },
    }));
    return orderId;
  }
  async sendDebugCommand(letter) {
    this.remoteAction({ type: 'DebugCommand', letter });
  }
}

const truck = new Truck();

export default truck;
