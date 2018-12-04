import { View } from 'react-native';
import React from 'react';
import GenericPage from './GenericPage';
import Button from '../../components/Button';

export default function ActionPage({ children, actions }) {
  return (
    <GenericPage
      afterScrollView={
        <View style={{ flexDirection: 'row' }}>
          {actions.map((action, i) => (
            <Button
              key={i}
              title={action.title}
              onPress={action.onPress}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      }
    >
      {children}
    </GenericPage>
  );
}
