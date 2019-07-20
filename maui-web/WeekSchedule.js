import React from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';
import View from '../views/View';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BaseText from '../dashboard/BaseText';
import { useTheme } from '../dashboard/Theme';
import ScheduleItem from './ScheduleItem';

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
        <Heading
          size="small"
          style={{ textAlign: 'center', alignSelf: 'center' }}
        >
          This Week
        </Heading>
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
        <BaseText
          bold
          style={{
            fontFamily: theme.fonts.bold,
            position: 'absolute',
            top: 28,
            left: 20,
          }}
        >
          TODAY
        </BaseText>
      ) : null}
      <Heading
        size="small"
        style={{ marginTop: 36 }}
        responsiveStyle={{
          lineHeight: [28, 36],
          marginBottom: [20, 16],
        }}
      >
        {label}
      </Heading>
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
              id: 1,
              time: '8:00 am - 2:00 pm',
              address: '633 West 5th St.\nLos Angeles, CA 90071',
              active: true,
            },
            {
              id: 2,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
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
              id: 1,
              time: '8:00 am - 2:00 pm',
              address: '633 West 5th St.\nLos Angeles, CA 90071',
              active: false,
            },
            {
              id: 2,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
              active: false,
            },
            {
              id: 3,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
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
              id: 1,
              time: '8:00 am - 2:00 pm',
              address: '633 West 5th St.\nLos Angeles, CA 90071',
              active: false,
            },
            {
              id: 2,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
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
              id: 1,
              time: '8:00 am - 2:00 pm',
              address: '633 West 5th St.\nLos Angeles, CA 90071',
              active: false,
            },
            {
              id: 2,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
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
              id: 1,
              time: '8:00 am - 2:00 pm',
              address: '633 West 5th St.\nLos Angeles, CA 90071',
              active: false,
            },
            {
              id: 2,
              time: '5:00 pm - 9:00 pm',
              address: '2738 Hyperion Ave.\nLos Angeles, CA 90027',
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
