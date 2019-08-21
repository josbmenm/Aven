import React from 'react';
import { KeyboardAvoidingView, View, StyleSheet, Image } from 'react-native';
import BackButton from './BackButton';
import { pageBackgroundColor } from './Styles';
import { useNavigation } from '../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';

export default function ShortBlockFormPage({
  children,
  hideBackButton,
  ...props
}) {
  const { goBack, navigate, dangerouslyGetParent } = useNavigation();
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
          onLongPress={() => {
            // for the purpose of leaving feedback experience in portal
            const parentNav = dangerouslyGetParent();
            const parentState = parentNav && parentNav.state;
            const parentKey = parentState && parentState.key;
            parentKey && goBack(parentKey);
          }}
        />
      )}
    </FadeTransition>
  );
}
ShortBlockFormPage.navigationOptions = FadeTransition.navigationOptions;
