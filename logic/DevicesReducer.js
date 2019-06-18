import defineCloudReducer from '../cloud-core/defineCloudReducer';

function DevicesReducerFn(state = {}, action) {
  console.log('devices reducer', state, action);
  function devicesExcludingId(devices, id) {
    return (devices || []).filter(d => d.deviceId !== id);
  }
  switch (action.type) {
    case 'WipeState': {
      return {};
    }
    case 'DeviceOnline': {
      return {
        ...state,
        devices: [
          ...devicesExcludingId(state.devices, action.deviceId),
          { deviceId: action.deviceId, onlineTime: Date.now() },
        ],
      };
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
