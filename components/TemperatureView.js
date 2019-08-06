import React from 'react';
import { Text, View } from 'react-native';
import { useCloudValue } from '../cloud-core/KiteReact';
import { titleStyle, proseFontFace, monsterra } from '../components/Styles';
function TempCell({ title, value, button }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ ...titleStyle, color: monsterra, fontSize: 20 }}>
        {title}
      </Text>
      <Text style={{ ...proseFontFace, color: monsterra, fontSize: 62 }}>
        {value}
      </Text>
      {button}
    </View>
  );
}
function formatTemp(value) {
  if (!value || value === 1562) {
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
      <View style={{ flexDirection: 'row' }}>
        {kitchenState.System_FreezerTemp_READ && (
          <TempCell
            title="Frozen Food"
            value={formatTemp(kitchenState.System_FreezerTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_YogurtZoneTemp_READ && (
          <TempCell
            title="Piston Fridge"
            value={formatTemp(kitchenState.System_YogurtZoneTemp_READ)}
            button={null}
          />
        )}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {kitchenState.System_BevTemp_READ && (
          <TempCell
            title="Beverage Fridge"
            value={formatTemp(kitchenState.System_BevTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_AmbientTemp_READ && (
          <TempCell
            title="Ambient"
            value={formatTemp(kitchenState.System_AmbientTemp_READ)}
            button={null}
          />
        )}
        {kitchenState.System_PsuTemp_READ && (
          <TempCell
            title="Power Box"
            value={formatTemp(kitchenState.System_PsuTemp_READ)}
          />
        )}
      </View>
    </React.Fragment>
  );
}
