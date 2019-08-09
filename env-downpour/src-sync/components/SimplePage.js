import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import Hero from './Hero';

export default function SimplePage({
  children,
  title,
  footer,
  icon,
  ...props
}) {
  return (
    <GenericPage {...props} afterScrollView={footer}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ flex: 1, maxWidth: 600 }}>
          {(title || icon) && <Hero title={title} icon={icon} />}
          {children}
        </View>
      </View>
    </GenericPage>
  );
}

SimplePage.navigationOptions = GenericPage.navigationOptions;
