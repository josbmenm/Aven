import React from 'react';
import { Text, View } from 'react-native';
import useCloudValue from '../cloud-core/useCloudValue';
import { useNavigation } from '../navigation-hooks/Hooks';

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
