import React from 'react';
import RowSection from '../components/RowSection';
import { View, Text } from 'react-native';
import { getSubsystemFaults, getSubsystemAlarms } from '../logic/MachineLogic';
import { prettyShadow, boldPrimaryFontFace } from '../components/Styles';
import { colorNegative, colorWarning } from './Onotheme';

function ErrorsSection({ errors, color }) {
  return (
    <RowSection>
      {errors.map(fault => (
        <View
          style={{
            backgroundColor: color,
            ...prettyShadow,
            marginBottom: 10,
            padding: 20,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              ...boldPrimaryFontFace,
              color: 'white',
              textAlign: 'center',
              fontSize: 36,
            }}
          >
            {fault}
          </Text>
        </View>
      ))}
    </RowSection>
  );
}

export function SystemFaultsAndAlarms({ system, kitchenState }) {
  const faults = getSubsystemFaults(system, kitchenState);
  const alarms = getSubsystemAlarms(system, kitchenState);
  return (
    <View>
      {faults && (
        <ErrorsSection
          errors={faults.map(f => f.description)}
          color={colorNegative}
        />
      )}
      {alarms && <ErrorsSection errors={alarms} color={colorWarning} />}
    </View>
  );
}
