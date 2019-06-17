import React from 'react';
import { View } from 'react-native';
import { useTheme } from './ThemeContext';
import { BodyText } from './Tokens';

function Schedule(props) {
  const theme = useTheme();
  const schedule = [
    {
      id: 1,
      time: '8:00 - 10:30 am',
      address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
    },
    {
      id: 2,
      time: '10:30 am - 2:30 pm',
      address: '981 35th St, Oakland, CA 94608',
    },
  ];

  return (
    <View>
      {schedule.map(item => (
        <ScheduleItem key={item.id} item={item} />
      ))}
    </View>
  );
}

function ScheduleItem({ item }) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderRadius: 8,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        padding: 20,
        marginBottom: 20,
        ...theme.shadows.medium,
      }}
    >
      <BodyText
        bold
        style={{
          fontSize: 13,
          fontFamily: theme.fonts.title,
          margin: 0
        }}
      >
        {item.time}
      </BodyText>
      <BodyText>{item.address}</BodyText>
    </View>
  );
}

export default Schedule;
