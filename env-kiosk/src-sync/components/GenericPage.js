import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { pageBackgroundColor } from './Styles';
import BackButton from './BackButton';
import { useNavigation } from '../navigation-hooks/Hooks';

import FadeTransition from './FadeTransition';

export default function GenericPage({
  children,
  afterScrollView,
  hideBackButton,
  disableScrollView,
  ...props
}) {
  const { goBack } = useNavigation();
  return (
    <FadeTransition
      {...props}
      background={
        <View style={{ flex: 1, backgroundColor: pageBackgroundColor }} />
      }
    >
      {disableScrollView ? (
        children
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{}}
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
