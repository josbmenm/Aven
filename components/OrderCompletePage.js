import React from 'react';
import ShortBlockFormPage from './ShortBlockFormPage';
import CountdownDoneButton from './CountdownDoneButton';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import {
  blockFormTitleTextStyle,
  blockFormMessageTextStyle,
  pinkColor,
} from './Styles';

function PageMessage({ message }) {
  return (
    <Text
      style={{
        marginHorizontal: 10,
        ...blockFormMessageTextStyle,
        textAlign: 'center',
      }}
    >
      {message}
    </Text>
  );
}

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

export default function OrderCompletePage({
  backBehavior,
  backRouteName,
  ...props
}) {
  const { navigate } = useNavigation();

  return (
    <ShortBlockFormPage
      backBehavior={backBehavior}
      {...props}
      hideBackButton={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <PageMessage message="Your order is on its way!" />
        <PageTitle title="mahalo! enjoy your blend." />
        <Image
          style={{
            tintColor: pinkColor,
            width: 200,
            height: 200,
            marginVertical: 30,
            alignSelf: 'center',
          }}
          source={require('./assets/Shaka.png')}
        />
      </View>
      <CountdownDoneButton
        onLongPress={() => {
          navigate('Home');
        }}
        onPress={() => {
          navigate(backRouteName);
        }}
      />
    </ShortBlockFormPage>
  );
}

OrderCompletePage.navigationOptions = ShortBlockFormPage.navigationOptions;
