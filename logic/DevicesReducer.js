import { defineCloudReducer } from '../cloud-core/KiteReact';

function DevicesReducerFn(state = {}, action) {
  function devicesExcludingId(devices, id) {
    return (devices || []).filter(d => d.deviceId !== id);
  }
  switch (action.type) {
    case 'WipeState': {
      return {};
    }
    case 'DeviceOnline': {
      if (
        state.devices &&
        state.devices.find(d => d.deviceId === action.deviceId)
      ) {
        return state;
      }
      return {
        ...state,
        devices: [
          ...devicesExcludingId(state.devices, action.deviceId),
          { deviceId: action.deviceId, onlineTime: Date.now() },
        ],
      };
    }
    case 'SetMode': {
      // action.deviceId
      // action.mode
      // return {}
    }
    case 'ForgetDevice': {
      return {
        ...state,
        devices: [...devicesExcludingId(state.devices, action.deviceId)],
      };
    }
    default: {
      return state;
    }
  }
}

const DevicesReducer = defineCloudReducer(
  'DevicesReducer',
  DevicesReducerFn,
  {},
);

export default DevicesReducer;
