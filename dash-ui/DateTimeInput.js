import React from 'react';
import DatePicker from './DatePicker';
import Text from './Text';
import { useTheme } from './Theme';
import { View, TouchableOpacity } from 'react-native';
import useDropdownView from './useDropdownView';

function TimeInput({ value, onValue }) {
  console.log('math of value!!', value);
  return <Text>Time</Text>;
}

export default function DateTimeInput({ theme: themeProp, value, onValue }) {
  const displayValue = value || Date.now();
  const theme = useTheme(themeProp);
  const { onPopover, targetRef } = useDropdownView(({ onClose }) => (
    <View style={{}}>
      <DatePicker
        when={value}
        onWhen={when => {
          onClose();
          console.log('time to reconcile time and date ', { value, when });
        }}
      />
    </View>
  ));
  return (
    <View
      style={{
        borderWidth: 3,
        borderColor: theme.colorPrimary,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity
        style={{
          borderWidth: 3,
          borderColor: 'green',
          width: 380,
          alignSelf: 'stretch',
        }}
        onPress={onPopover}
      >
        <View style={{ flex: 1, width: 380, borderWidth: 1 }} ref={targetRef}>
          <Text>Date:. {displayValue}</Text>
        </View>
      </TouchableOpacity>
      <TimeInput value={displayValue} onValue={onValue} />
    </View>
  );
}
