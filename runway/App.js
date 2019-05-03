import React, { useState, useReducer } from 'react';
import { View, Text, Animated, Button, TextInput } from 'react-native';
import useCloudState from '../cloud-core/useCloudState';
import useCloudReducer from '../cloud-core/useCloudReducer';
import cuid from 'cuid';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 42 }}>Todo..</Text>
    </View>
  );
}
