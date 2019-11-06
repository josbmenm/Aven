import { defineCloudReducer } from '../cloud-core/KiteReact';

function RecentCompletedTasksFn(state = {}, action) {
  const defaultReturn = () => {
    return {
      ...state,
      // lastAction: action,
      // lastLastAction: state.lastAction,

      // actionCount: (state.actionCount || 0) + 1,
    };
  };
  switch (action.type) {
    case 'TaskCompletion': {
      return {
        ...defaultReturn(),
        tasks: [
          ...(state.tasks ? state.tasks.slice(-49) : []),
          {
            ...action.task,
          },
        ],
      };
    }
    default: {
      return defaultReturn();
    }
  }
}

const RecentCompletedTasks = defineCloudReducer(
  'RecentCompletedTasks5',
  RecentCompletedTasksFn,
  {},
);

export default RecentCompletedTasks;
