import React, { Component } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { pageBackgroundColor } from './Styles';
import BackButton from './BackButton';
import GenericPage from './GenericPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import Hero from './Hero';

import FadeTransition from './FadeTransition';

export default function TwoPanePage({
  children,
  hideBackButton,
  disableScrollView,
  side,
  afterSide,
  title,
  icon,
  footer,
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
      {(title || icon) && <Hero title={title} icon={icon} />}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
          >
            {side}
          </ScrollView>
          {afterSide}
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
      {footer}
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
TwoPanePage.navigationOptions = FadeTransition.navigationOptions;
