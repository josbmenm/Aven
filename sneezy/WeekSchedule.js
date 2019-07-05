import React from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';
import View from '../views/View';
import Container from './Container';
import Title from './Title';
import { useTheme } from '../dashboard/Theme';
import ScheduleItem from './ScheduleItem';
import FootNote from './FootNote';

function WeekSchedule() {
  const theme = useTheme();
  const schedule = useWeekSchedule();
  const [startGradient, setStartGradient] = React.useState(null);
  const [endGradient, setEndGradient] = React.useState(true);

  function handleScroll({ nativeEvent }) {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const limitOffset = contentSize.width - 40;

    if (contentOffset.x > 10) {
      setStartGradient(true);
    } else {
      setStartGradient(false);
    }

    if (contentOffset.x + layoutMeasurement.width < limitOffset) {
      setEndGradient(true);
    } else {
      setEndGradient(false);
    }
  }
  console.log('COMPONENT RENDERED');
  return (
    <View style={{ paddingVertical: 80 }}>
      <Container
        style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingBottom: 100,
        }}
      >
        <Title style={{ textAlign: 'center', alignSelf: 'center' }}>
          This Week
        </Title>
        {schedule && (
          <View style={{ paddingVertical: 60, position: 'relative' }}>
            <ScrollView
              horizontal
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {schedule.map(day => (
                <DaySchedule key={day.id} day={day} />
              ))}
            </ScrollView>
            {startGradient && (
              <Image
                style={{
                  position: 'absolute',
                  top: 0,
                  left: -4,
                  bottom: 0,
                  width: 88,
                  height: '100%',
                  transform: [{ rotate: '180deg' }],
                }}
                source={require('./public/img/white-gradient.png')}
                resizeMode="repeat"
              />
            )}
            {endGradient && (
              <Image
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 88,
                  height: '100%',
                }}
                source={require('./public/img/white-gradient.png')}
                resizeMode="repeat"
              />
            )}
          </View>
        )}
      </Container>
    </View>
  );
}

function DaySchedule({ day }) {
  const { today, label, schedule } = day;
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width: 308,
          padding: 20,
          marginHorizontal: 10,
          borderRadius: theme.radii[3],
          overflow: 'hidden',
          position: 'relative',
        },
        today ? { backgroundColor: theme.colors.lightGrey } : {},
      ]}
    >
      {today ? (
        <FootNote
          bold
          style={{
            position: 'absolute',
            top: 28,
            left: 20,
          }}
        >
          TODAY
        </FootNote>
      ) : null}
      <Title
        style={{ marginTop: 36 }}
        responsiveStyle={{
          lineHeight: [32, 36],
          marginBottom: [20, 16],
        }}
      >
        {label}
      </Title>
      {schedule.map(item => (
        <ScheduleItem style={{ marginBottom: 20 }} key={item.id} item={item} />
      ))}
    </View>
  );
}

function useWeekSchedule() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    setTimeout(() => {
      setData([
        {
          id: 1,
          today: true,
          label: 'Monday',
          schedule: [
            {
              id: 11,
              time: '8:00 - 10:30 am',
              address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
              active: true,
            },
            {
              id: 12,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
          ],
        },
        {
          id: 2,
          today: false,
          label: 'Tuesday',
          schedule: [
            {
              id: 21,
              time: '8:00 - 10:30 am',
              address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
              active: false,
            },
            {
              id: 22,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
            {
              id: 23,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
          ],
        },
        {
          id: 3,
          today: false,
          label: 'Wednesday',
          schedule: [
            {
              id: 31,
              time: '8:00 - 10:30 am',
              address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
              active: false,
            },
            {
              id: 32,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
          ],
        },
        {
          id: 4,
          today: false,
          label: 'Thursday',
          schedule: [
            {
              id: 41,
              time: '8:00 - 10:30 am',
              address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
              active: false,
            },
            {
              id: 42,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
          ],
        },
        {
          id: 5,
          today: false,
          label: 'Friday',
          schedule: [
            {
              id: 51,
              time: '8:00 - 10:30 am',
              address: '420 7th Ave. Apt 301 San Francisco, CA, 94118',
              active: false,
            },
            {
              id: 52,
              time: '10:30 am - 2:30 pm',
              address: '981 35th St, Oakland, CA 94608',
              active: false,
            },
          ],
        },
      ]);
    }, 1000);
  }, []);

  return data;
}

export default WeekSchedule;
