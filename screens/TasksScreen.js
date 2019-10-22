import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import BlendTasker from '../components/BlendTasker';
import CustomTasker from '../components/CustomTasker';
import StatusBar from '../components/StatusBar';
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
          restaurantState.queue
            .filter(Boolean)
            .reverse()
            .map(taskState => (
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
      {(restaurantState.delivery0 || restaurantState.delivery1) && (
        <RowSection title="ready for pickup">
          {restaurantState.delivery0 && (
            <TaskRow
              key={restaurantState.delivery0.id}
              taskState={restaurantState.delivery0.task}
            />
          )}
          {restaurantState.delivery1 && (
            <TaskRow
              key={restaurantState.delivery1.id}
              taskState={restaurantState.delivery1.task}
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
      footer={<StatusBar />}
    >
      <BlendTasker />
      <CustomTasker />
    </TwoPanePage>
  );
}

TasksScreen.navigationOptions = TwoPanePage.navigationOptions;
