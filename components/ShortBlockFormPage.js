import React from 'react';
import { KeyboardAvoidingView, View, StyleSheet, Image } from 'react-native';
import BackButton from './BackButton';
import { pageBackgroundColor } from './Styles';
import { useNavigation } from '../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';

export default function ShortBlockFormPage({
  children,
  backBehavior,
  hideBackButton,
  ...props
}) {
  const { goBack } = useNavigation();
  return (
    <FadeTransition
      backgroundColor={pageBackgroundColor}
      background={
        <Image
          source={require('./assets/BgGeneric.png')}
          style={{
            flex: 1,
            width: null,
            height: null,
            resizeMode: 'contain',
            ...StyleSheet.absoluteFillObject,
          }}
        />
      }
      {...props}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      >
        {children}
      </KeyboardAvoidingView>
      {!hideBackButton && (
        <BackButton
          backBehavior={() => {
            goBack(null);
          }}
        />
      )}
    </FadeTransition>
  );
}
ShortBlockFormPage.navigationOptions = FadeTransition.navigationOptions;
