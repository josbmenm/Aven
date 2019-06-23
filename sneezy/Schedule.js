import React from 'react';
import { View } from 'react-native';
import { Responsive } from './Responsive';
import { useTheme } from '../dashboard/Theme'
import BodyText from './BodyText';

function Schedule(props) {
  const schedule = [
    {
      id: 1,
      time: '8:00 - 10:30 am',
      address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
      active: true,
    },
    {
      id: 2,
      time: '10:30 am - 2:30 pm',
      address: '981 35th St, Oakland, CA 94608',
      active: false,
    },
  ];

  return (
    <View {...props}>
      {schedule.map((item, index) => (
        <ScheduleItem
          key={item.id}
          item={item}
          first={index === 0}
          last={index === schedule.length - 1}
        />
      ))}
    </View>
  );
}

function ScheduleItem({ item, first, last }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        position: 'relative',
      }}
    >
      <Responsive
        style={{
          left: [8, -40],
        }}
      >
        <View
          style={{
            width: 3,
            backgroundColor: theme.colors.primary,
            position: 'absolute',
            top: first ? '50%' : 0,
            bottom: last ? '50%' : 0,
          }}
        />
      </Responsive>
      <Responsive
        style={{
          left: [0, -48],
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            position: 'absolute',
            backgroundColor: theme.colors.primary,
            borderWidth: 3,
            borderColor: theme.colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
          }}
        >
          {item.active && (
            <View
              style={{
                backgroundColor: theme.colors.white,
                width: 8,
                height: 8,
                borderRadius: 4,
              }}
            />
          )}
        </View>
      </Responsive>
      <Responsive style={{
        marginLeft: [40, 0]
      }}>
      <View
        style={{
          flex: 1,
          borderRadius: 8,
          borderWidth: 3,
          borderColor: item.active ? theme.colors.primary : 'transparent',
          padding: 20,
          ...theme.shadows.medium,
        }}
      >
        <BodyText
          bold
          style={{
            fontSize: 12,
            lineHeight: 16,
            fontFamily: theme.fontFamily.title,
            margin: 0,
          }}
        >
          {item.time}
        </BodyText>
        <BodyText style={{ marginBottom: 0 }}>{item.address}</BodyText>
      </View>
      </Responsive>
    </View>
  );
}

export default Schedule;
