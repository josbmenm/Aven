import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import BlendOrder from '../components/BlendTasker';
import CustomTasker from '../components/CustomTasker';
import TaskInfo from '../components/TaskInfo';
import RowSection from '../components/RowSection';
import { useRestaurantState } from '../ono-cloud/Kitchen';

function TaskQueueRow({ onCancel, taskState }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
      }}
    >
      <TaskInfo task={taskState} />
      <Text style={{ alignSelf: 'center', margin: 10 }}>
        {taskState.fills.length} fills
      </Text>
      <Button onPress={onCancel} title="Cancel" />
    </View>
  );
}

function OrderQueue({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <RowSection title="upcoming tasks">
      {restaurantState.queue &&
        restaurantState.queue.filter(Boolean).map(taskState => (
          <TaskQueueRow
            key={taskState.id}
            taskState={taskState}
            onCancel={() => {
              dispatch({ type: 'CancelTask', id: taskState.id });
            }}
          />
        ))}
    </RowSection>
  );
}

function OrdersList({ restaurantState, dispatch }) {
  return <OrderQueue restaurantState={restaurantState} dispatch={dispatch} />;
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  return (
    <TwoPanePage
      {...props}
      afterSide={null}
      hideBackButton
      side={
        <OrdersList restaurantState={restaurantState} dispatch={dispatch} />
      }
    >
      <BlendOrder />
      <CustomTasker />
    </TwoPanePage>
  );
}

OrdersScreen.navigationOptions = TwoPanePage.navigationOptions;
