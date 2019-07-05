import React from 'react';
import { View } from 'react-native';
import FootNote from './FootNote';
import ScheduleItem from './ScheduleItem';
import { useTheme } from '../dashboard/Theme'
import { Responsive } from '../dashboard/Responsive';

function useSchedule() {
  const [schedule, setSchedule] = React.useState(null);
  React.useEffect(() => {
    setTimeout(() => {
      setSchedule([
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
      ]);
    }, 2000);
  }, []);

  return React.useMemo(() => schedule, [schedule])
}

function Schedule({ withFloatingLabel = false, ...rest }) {
  const schedule = useSchedule();

  return (
    <View {...rest}>
      {withFloatingLabel ? (
        <FootNote
          bold
          className="hide-mobile"
          style={{
            position: 'absolute',
            top: 24,
            left: -120,
          }}
        >
          We're Here!
        </FootNote>
      ) : null}
      {schedule &&
        schedule.map((item, index) => (
          <DayScheduleItem
            style={{ flex: 1 }}
            key={item.id}
            item={item}
            first={index === 0}
            last={index === schedule.length - 1}
          />
        ))}
    </View>
  );
}

function DayScheduleItem({ item, first, last, style }) {
  const theme = useTheme();
  return (
    <View
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        position: 'relative',
      }, style]}
    >
      <Responsive
        style={{
          left: [8, -40],
        }}
      >
        <View
          style={{
            width: 3,
            backgroundColor: theme.colors.monsterra,
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
            backgroundColor: theme.colors.monsterra,
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
      <Responsive
        style={{
          marginLeft: [40, 0],
        }}
      >
        <ScheduleItem style={{ flex: 1 }} item={item} />
      </Responsive>
    </View>
  );
}

export default Schedule;
