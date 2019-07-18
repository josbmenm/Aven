import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import {
  genericPageStyle,
  splashText,
  highlightPrimaryColor,
} from '../components/Styles';
import { useNavigation } from '../navigation-hooks/Hooks';

import FadeTransition from '../components/FadeTransition';

export default function FeedbackHomePage({ navigation, onSubmit, ...props }) {
  const { navigate } = useNavigation();
  return (
    <FadeTransition
      {...props}
      navigation={navigation}
      background={
        <Image
          source={require('../components/assets/BgHome.png')}
          style={{
            width: null,
            height: null,
            resizeMode: 'contain',
            ...StyleSheet.absoluteFillObject,
          }}
        />
      }
    >
      <TouchableWithoutFeedback
        onPress={
          onSubmit ||
          (() => {
            navigate('FeedbackRating');
          })
        }
      >
        <View
          style={{ flex: 1, justifyContent: 'center', ...genericPageStyle }}
        >
          <Image
            style={{
              width: '100%',
              height: 200,
              resizeMode: 'contain',
              tintColor: highlightPrimaryColor,
            }}
            source={require('../components/assets/OnoBlendsLogo.png')}
          />

          <Text
            style={{
              ...splashText,
              textAlign: 'center',
              marginVertical: 40,
            }}
          >
            tap to provide feedback
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </FadeTransition>
  );
}

FeedbackHomePage.navigationOptions = FadeTransition.navigationOptions;
