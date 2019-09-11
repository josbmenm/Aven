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
    case 'SetDevice': {
      const lastDevice = (state.devices || []).find(
        d => d.deviceId === action.deviceId,
      );
      if (!lastDevice) {
        return state;
      }
      const newDevice = {
        ...lastDevice,
        mode: action.mode ? action.mode : lastDevice.mode,
        name: action.name ? action.name : lastDevice.name,
        mdmId: action.mdmId ? action.mdmId : lastDevice.mdmId,
      };
      return {
        ...state,
        devices: state.devices.map(device => {
          if (action.deviceId === device.deviceId) {
            return newDevice;
          }
          return device;
        }),
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
