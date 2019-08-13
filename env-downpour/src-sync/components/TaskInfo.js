import React from 'react';
import { View, Text } from 'react-native';
import { proseFontFace, primaryFontFace, monsterra80 } from './Styles';

export default function TaskInfo({ task }) {
  if (!task) {
    return (
      <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
        <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
          Unknown Order
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignSelf: 'stretch', padding: 10 }}>
      <Text style={{ fontSize: 32, ...proseFontFace, color: monsterra80 }}>
        {task.name}
      </Text>
      <Text style={{ fontSize: 24, ...primaryFontFace, color: '#282828' }}>
        {task.blendName}
      </Text>
    </View>
  );
}
