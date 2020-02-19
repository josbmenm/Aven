import React from 'react';
import { View, Text, TouchableOpacity } from '@rn';

export default function TaskRow({ task, onRemove }) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginHorizontal: 20,
        padding: 10,
        flexDirection: 'row',
      }}
    >
      <Text key={task.id} style={{ fontSize: 32, color: '#222', flex: 1 }}>
        {task.title}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove}>
          <Text style={{ color: '#611', fontSize: 24 }}>X</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
