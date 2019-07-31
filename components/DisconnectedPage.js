import React from 'react';
import { View, Text } from 'react-native';
import { blockFormTitleTextStyle } from './Styles';
import Spinner from '../components/Spinner';
import Animated, { Easing } from '../views/Animated';

function PageTitle({ title }) {
  return (
    <Text
      style={{
        marginHorizontal: 10,
        ...blockFormTitleTextStyle,
        textAlign: 'center',
      }}
    >
      {title}
    </Text>
  );
}

export default function DisconnectedPage() {
  const [opacity] = React.useState(new Animated.Value(0));
  React.useEffect(() => {
    let t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
      }).start();
    }, 450);
    return () => {
      clearTimeout(t);
    };
  }, []);
  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <PageTitle title="connecting to the restaurant.." />
      <View style={{ marginTop: 60 }}>
        <Spinner />
      </View>
    </Animated.View>
  );
}
