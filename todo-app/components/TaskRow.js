import React from 'react';
import { View, Text } from 'react-native';

export default function TaskRow({ task }) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginHorizontal: 20,
        padding: 10,
      }}
    >
      <Text key={task.id} style={{ fontSize: 32, color: '#222' }}>
        {task.title}
      </Text>
    </View>
  );
}
