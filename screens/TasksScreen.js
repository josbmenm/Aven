import React from 'react';
import { View, Text } from 'react-native';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import BlendTasker from '../components/BlendTasker';
import CustomTasker from '../components/CustomTasker';
import StatusBar from '../components/StatusBar';
import { FillsDisplay } from './SequencerScreen';
import TaskInfo from '../components/TaskInfo';
import RowSection from '../components/RowSection';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useCloudValue } from '../cloud-core/KiteReact';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import cuid from 'cuid';
import { primaryFontFace, standardTextColor } from '../components/Styles';

function TaskRow({ onCancel, isDropping, onDoNext, taskState, onRemake }) {
  if (!taskState) {
    return null;
  }
  let cancelButton = onCancel && (
    <Button
      onPress={onCancel}
      title="cancel"
      type="outline"
      style={{ marginLeft: 8 }}
    />
  );
  if (isDropping) {
    cancelButton = (
      <Text
        style={{
          ...primaryFontFace,
          color: standardTextColor,
          fontSize: 18,
          marginTop: 16,
        }}
      >
        Dropping..
      </Text>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
      }}
    >
      <TaskInfo
        task={taskState}
        buttons={
          <View style={{ flexDirection: 'row' }}>
            {onDoNext && (
              <Button
                onPress={onDoNext}
                title="do next"
                type="outline"
                style={{ marginLeft: 8 }}
              />
            )}
            {cancelButton}
            {onRemake && (
              <Button
                onPress={onRemake}
                title="re-make"
                type="outline"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        }
      />
    </View>
  );
}

function CompletedTasks({ dispatch }) {
  const resp = useCloudValue('RecentCompletedTasks');
  console.log(resp);
  if (!resp || !resp.tasks) return null;

  return resp.tasks
    .slice()
    .reverse()
    .map(taskReceipt => (
      <TaskRow
        key={taskReceipt.id}
        taskState={taskReceipt.task}
        onRemake={() => {
          dispatch({
            type: 'QueueTasks',
            tasks: [
              {
                ...taskReceipt.task,
                id: cuid(),
                remakeOfTaskId: taskReceipt.task.id,
              },
            ],
          });
        }}
      />
    ));
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
              />
            ))}
      </RowSection>
      {restaurantState.fill && restaurantState.fill !== 'ready' && (
        <RowSection title="filling">
          <TaskRow
            key={restaurantState.fill.id}
            taskState={restaurantState.fill.task}
            onCancel={() => {
              dispatch({ type: 'RequestFillDrop' });
            }}
            isDropping={!!restaurantState.fill.requestedDropTime}
          />
          <FillsDisplay state={restaurantState.fill} />
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
      <RowSection title="past tasks">
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
        <CompletedTasks dispatch={dispatch} />
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
