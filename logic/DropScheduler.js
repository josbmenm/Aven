import { defineCloudReducer } from '../cloud-core/KiteReact';

function DropSchedulerFn(state = {}, action) {
  switch (action.type) {
    case 'ScheduleDrop': {
      const scheduled = state.scheduled ? [...state.scheduled] : [];
      let insertAtIndex = 0;
      // todo, determine insertAtIndex and sort by action.drop.time
      scheduled.splice(insertAtIndex, 0, {
        ...action.drop,
        id: action.dispatchId,
      });
      return {
        ...state,
        scheduled,
      };
    }
    default: {
      return state;
    }
  }
}

const DropScheduler = defineCloudReducer(
  'DropScheduler-002',
  DropSchedulerFn,
  {},
);

export default DropScheduler;
