import React from 'react';
import { Text, View } from 'react-native';
import useCloud from '../aven-cloud/useCloud';
import useObservable from '../aven-cloud/useObservable';
function alertDone() {
  alert('done');
}
function alertError(e) {
  console.error(e);
  alert('error');
}

export default function App() {
  const cloud = useCloud();
  const log = cloud.get('log');
  // const data = useObservable(log.observeValue);

  React.useEffect(() => {
    cloud.get('reduceLog').put({
      code: `(val) => {
        return val && val.value.much;
      }`,
    });
  }, []);

  // cloud.get('log^reduceLog')
  const data = useObservable(cloud.get('log^reduceLog').observeValue);
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          // alert('Hello, client code!');
          // log
          //   .put({ changed: 'value ' })
          //   .then(alertDone)
          //   .catch(alertError);

          log
            .putTransaction({ much: 'value' })
            .then(alertDone)
            .catch(alertError);
        }}
      >
        Hello {JSON.stringify(data)}
      </Text>
    </View>
  );
}
