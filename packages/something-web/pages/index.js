// @generated: @expo/next-adapter@2.0.0-beta.9
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@aven-cloud/dash';

export default function App() {
  return (
    <View style={styles.container}>
      <Button />
      <Text style={styles.text}>Welcome to Expo + Next.js 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});
