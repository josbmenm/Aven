import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { pageBackgroundColor } from './Styles';
import BackButton from './BackButton';
import { useNavigation } from '../navigation-hooks/Hooks';
import Hero from './Hero';

import FadeTransition from './FadeTransition';

export default function GenericPage({
  children,
  hideBackButton,
  disableScrollView,
  side,
  title,
  icon,
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
      <Hero title={title} icon={icon} />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
          >
            {side}
          </ScrollView>
        </View>
        <View style={{ flex: 1 }}>
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
        </View>
      </View>
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
