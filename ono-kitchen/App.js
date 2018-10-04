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
