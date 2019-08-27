import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import BlendTasker from '../components/BlendTasker';
import CustomTasker from '../components/CustomTasker';
import TaskInfo from '../components/TaskInfo';
import RowSection from '../components/RowSection';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import cuid from 'cuid';

function TaskRow({ onCancel, onDoNext, taskState, onRemake }) {
  if (!taskState) {
    return null;
  }
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
      {onCancel && <Button onPress={onCancel} title="cancel" type="outline" />}
      {onDoNext && <Button onPress={onDoNext} title="do next" type="outline" />}
      {onRemake && <Button onPress={onRemake} title="re-make" type="outline" />}
    </View>
  );
}

function TaskQueue({ restaurantState, dispatch }) {
  if (!restaurantState) {
    return null;
  }
  return (
    <React.Fragment>
      <RowSection title="queued tasks">
        {restaurantState.queue &&
          restaurantState.queue.filter(Boolean).map(taskState => (
            <TaskRow
              key={taskState.id}
              taskState={taskState}
              onCancel={() => {
                dispatch({ type: 'CancelTask', id: taskState.id });
              }}
              onDoNext={() => {
                dispatch({ type: 'DoTaskNext', id: taskState.id });
              }}
              onRemake={() => {
                dispatch({
                  type: 'QueueTasks',
                  tasks: [
                    {
                      ...taskState,
                      id: cuid(),
                      remakeOfTaskId: taskState.id,
                    },
                  ],
                });
              }}
            />
          ))}
      </RowSection>
      {restaurantState.fill && restaurantState.fill !== 'ready' && (
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
      <RowSection title="failed tasks">
        {restaurantState.failedTasks &&
          restaurantState.failedTasks.filter(Boolean).map(taskState => (
            <TaskRow
              key={taskState.id}
              taskState={taskState}
              onRemake={() => {
                dispatch({
                  type: 'QueueTasks',
                  tasks: [
                    {
                      ...taskState,
                      id: cuid(),
                      remakeOfTaskId: taskState.id,
                    },
                  ],
                });
              }}
            />
          ))}
      </RowSection>

      <RowSection title="completed tasks">
        {restaurantState.completedTasks &&
          restaurantState.completedTasks.filter(Boolean).map(completed => (
            <TaskRow
              key={completed.id}
              taskState={completed.task}
              onRemake={() => {
                dispatch({
                  type: 'QueueTasks',
                  tasks: [
                    {
                      ...completed.task,
                      id: cuid(),
                      remakeOfTask: completed.task.id,
                    },
                  ],
                });
              }}
            />
          ))}
      </RowSection>
    </React.Fragment>
  );
}

export default function TasksScreen(props) {
  const [restaurantState, dispatch] = useRestaurantState();
  const navigation = useNavigation();
  return (
    <TwoPanePage
      {...props}
      afterSide={null}
      hideBackButton
      side={<TaskQueue restaurantState={restaurantState} dispatch={dispatch} />}
    >
      <BlendTasker />
      <CustomTasker />
    </TwoPanePage>
  );
}

TasksScreen.navigationOptions = TwoPanePage.navigationOptions;
