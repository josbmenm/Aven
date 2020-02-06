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
  contentContainerStyle,
  ...props
}) {
  const { goBack, dangerouslyGetParent } = useNavigation();
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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            ...contentContainerStyle,
          }}
        >
          {children}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            ...contentContainerStyle,
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
GenericPage.navigationOptions = FadeTransition.navigationOptions;
