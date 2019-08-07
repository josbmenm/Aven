import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import BlendOrder from '../components/BlendTasker';
import CustomTasker from '../components/CustomTasker';
import TaskInfo from '../components/TaskInfo';
import Row from '../components/Row';
import RowSection from '../components/RowSection';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useRestaurantState } from '../ono-cloud/Kitchen';

function TaskRow({ onCancel, taskState }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
      }}
    >
      <TaskInfo task={taskState} />
      {taskState.fills && (
        <Text style={{ alignSelf: 'center', margin: 10 }}>
          {taskState.fills.length} fills
        </Text>
      )}
      {onCancel && <Button onPress={onCancel} title="Cancel" />}
    </View>
  );
}

function OrderQueue({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <React.Fragment>
      <RowSection title="upcoming tasks">
        {restaurantState.queue &&
          restaurantState.queue.filter(Boolean).map(taskState => (
            <TaskRow
              key={taskState.id}
              taskState={taskState}
              onCancel={() => {
                dispatch({ type: 'CancelTask', id: taskState.id });
              }}
            />
          ))}
      </RowSection>
      {restaurantState.fill && (
        <RowSection title="filling">
          <TaskRow
            key={restaurantState.fill.id}
            taskState={restaurantState.fill.task}
          />
        </RowSection>
      )}
      {restaurantState.blend && (
        <RowSection title="blending">
          <TaskRow
            key={restaurantState.blend.id}
            taskState={restaurantState.blend.task}
          />
        </RowSection>
      )}
      {restaurantState.delivery && (
        <RowSection title="delivering">
          <TaskRow
            key={restaurantState.delivery.id}
            taskState={restaurantState.delivery.task}
          />
        </RowSection>
      )}
      {(restaurantState.deliveryA || restaurantState.deliveryB) && (
        <RowSection title="ready for pickup">
          {restaurantState.deliveryA && (
            <TaskRow
              key={restaurantState.deliveryA.id}
              taskState={restaurantState.deliveryA.task}
            />
          )}
          {restaurantState.deliveryB && (
            <TaskRow
              key={restaurantState.deliveryB.id}
              taskState={restaurantState.deliveryB.task}
            />
          )}
        </RowSection>
      )}
      <RowSection title="completed tasks">
        {restaurantState.completedTasks &&
          restaurantState.completedTasks
            .filter(Boolean)
            .map(taskState => (
              <TaskRow key={taskState.id} taskState={taskState.task} />
            ))}
      </RowSection>
    </React.Fragment>
  );
}

function OrdersList({ restaurantState, dispatch }) {
  return <OrderQueue restaurantState={restaurantState} dispatch={dispatch} />;
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  const navigation = useNavigation();
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
      <Row title="kiosk app">
        <Button
          title="start order"
          onPress={() => {
            navigation.navigate({ routeName: 'ProductHome' });
          }}
        />
      </Row>
    </TwoPanePage>
  );
}

OrdersScreen.navigationOptions = TwoPanePage.navigationOptions;
