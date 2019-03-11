import React, { Component } from 'react';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { pageBackgroundColor } from './Styles';
import BackButton from './BackButton';
import { useNavigation } from '../navigation-hooks/Hooks';

import FadeTransition from './FadeTransition';

export default function GenericPage({
  children,
  afterScrollView,
  hideBackButton,
  ...props
}) {
  const { goBack } = useNavigation();
  return (
    <FadeTransition
      {...props}
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
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{}}>
        {children}
      </ScrollView>
      {afterScrollView}
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
GenericPage.navigationOptions = FadeTransition.navigationOptions;
