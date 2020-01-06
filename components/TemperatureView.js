import React from 'react';
import { Text, View } from 'react-native';
import { useCloudValue } from '../cloud-core/KiteReact';
import { Stack } from '../dash-ui';
import { titleStyle, proseFontFace, monsterra } from '../components/Styles';
import { colorNeutral } from './Onotheme';

export function TempCell({ title, value, button }) {
  return (
    <View>
      <Text style={{ ...titleStyle, color: colorNeutral, fontSize: 20 }}>
        {title}
      </Text>
      <Text style={{ ...proseFontFace, color: monsterra, fontSize: 62 }}>
        {value}
      </Text>
      {button}
    </View>
  );
}
export function formatTemp(value) {
  if (value == null || value === 1562) {
    return '?';
  }
  return `${value}°F`;
}
export default function TemperatureView() {
  const kitchenState = useCloudValue('KitchenState');
  if (!kitchenState) {
    return null;
  }
  return (
    <React.Fragment>
      <Stack horizontal>
        {kitchenState.System_FreezerTemp_READ != null && (
          <TempCell
            title="Frozen Food"
            value={formatTemp(kitchenState.System_FreezerTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_YogurtZoneTemp_READ != null && (
          <TempCell
            title="Piston Fridge"
            value={formatTemp(kitchenState.System_YogurtZoneTemp_READ)}
            button={null}
          />
        )}
      </Stack>
      <Stack horizontal>
        {kitchenState.System_BevTemp_READ != null && (
          <TempCell
            title="Beverage Fridge"
            value={formatTemp(kitchenState.System_BevTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_AmbientTemp_READ != null && (
          <TempCell
            title="Ambient"
            value={formatTemp(kitchenState.System_AmbientTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_PsuTemp_READ != null && (
          <TempCell
            title="Power Box"
            value={formatTemp(kitchenState.System_PsuTemp_READ)}
          />
        )}
      </Stack>
    </React.Fragment>
  );
}
