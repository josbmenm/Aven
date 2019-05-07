import React, { Component } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { pageBackgroundColor } from './Styles';
import BackButton from './BackButton';
import { useNavigation } from '../navigation-hooks/Hooks';

import FadeTransition from './FadeTransition';

export default function GenericPage({
  children,
  afterScrollView,
  background,
  hideBackButton,
  disableScrollView,
  ...props
}) {
  const { goBack } = useNavigation();
  return (
    <FadeTransition
      {...props}
      background={
        <View
          style={{ backgroundColor: 'white', ...StyleSheet.absoluteFillObject }}
        >
          <View
            style={{
              position: 'absolute',
              width: 1366, // yes I am going straight to hell
              height: 1024, // ...cant figure out real layout inside FadeTransition..
            }}
          >
            {background || (
              <View style={{ flex: 1, backgroundColor: pageBackgroundColor }} />
            )}
          </View>
        </View>
      }
    >
      {disableScrollView ? (
        children
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            // alignItems: 'center',
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
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
