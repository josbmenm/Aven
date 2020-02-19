import React from 'react';
import { Text, View } from '@rn';
import useCloudValue from '../cloud-core/useCloudValue';
import { useNavigation } from '@aven/navigation-hooks';

export default function Task() {
  const { getParam } = useNavigation();
  const taskId = getParam('taskId');
  const todoListValue = useCloudValue('Todos');
  const task = todoListValue.tasks.find(t => t.id === taskId);
  return (
    <View style={{ flex: 1 }}>
      <Text onPress={() => {}}>{task.title}</Text>
    </View>
  );
}
