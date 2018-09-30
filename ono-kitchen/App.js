import { View, Text } from 'react-native';
import React from 'react';
import withObservables from '@nozbe/with-observables';
import { Observable } from 'rxjs-compat';

const someData = Observable.create(function(observer) {
  console.log('!!observed');
  observer.next(1);
  setTimeout(() => {
    observer.next(4);
  }, 2000);
  return () => {
    console.log('!! done observing');
  };
});

// const withObservable = Component => {
//   class ObservableComponent extends React.Component {
//     constructor(props) {
//       super(props);
//     }
//     static getDerivedStateFromProps = (props, prevState) => {

//     }
//     componentDidMount() {}
//     componentDidUpdate() {}
//     componentWillUnmount() {}
//     render() {
//       const props = {};
//       Object.keys(this.state).forEach(stateKey => {

//       })
//       return <Component {...this.props} />;
//     }
//   }
//   return ObservableComponent;
// };

const ShowsData = withObservables(['data'], props => ({ data: props.data }))(
  ({ data }) => {
    return (
      <View>
        <Text>Observed: {data}</Text>
      </View>
    );
  },
);
console.log('ohk====');

class Ref {
  constructor(client, host, name) {
    this._client = client;
    this._host = host;
    this._name = name;
  }

  observe = Observable.create(observer => {
    return () => {
      console.log('Ref done observing!');
    };
  });
}

class Host {
  constructor(client, hostConfig) {
    this._client = client;
    this._config = hostConfig;
  }
  getHostName() {
    if (typeof this._config === 'string') {
      return this._config;
    }
    if (this._config.host) {
      return this._config.host;
    }
  }
  getUseSSL() {
    if (this._config.useSSL != null) {
      return this._config.useSSL;
    }
    return true;
  }
  getRef(refName) {
    return new Ref(this._client, this, refName);
  }
}

class SaveClient {
  constructor(opts) {
    this._dispatch = opts.dispatch;
    this._connection = opts.connection;
  }
  getHost(hostConfig) {
    return new Host(hostConfig);
  }
  getRef(hostConfig, refName) {
    const host = this.getHost(hostConfig);
    return host.getRef(refName);
  }
  getOwnRef(refName) {
    return new Ref(this, null, refName);
  }
}

export default class App extends React.Component {
  save = new SaveClient({
    dispatch: this.props.dispatch,
    connection: this.props.connection,
  });

  render() {
    const { env } = this.props;
    const { showData } = this.state;
    console.log('rendering app==== ' + showData);
    return (
      <View style={{ flex: 1 }}>
        <Text
          onPress={() => {
            alert('hello');
          }}
        >
          {showData && <ShowsData data={someData} />}
          Ono Kitchen
        </Text>
      </View>
    );
  }
}
