import React from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';
import View from '../views/View';
import { useCloudValue } from '../cloud-core/KiteReact';
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
  let todayIndex = 0;
  const scrollView = React.useRef(null);
  const days =
    schedule &&
    schedule.map((day, index) => {
      const today = day.key === DAYS[new Date().getDay()];
      if (today) {
        todayIndex = index;
      }
      return <DaySchedule key={day.key} day={day} today={today} />;
    });
  React.useEffect(() => {
    const sv = scrollView.current;
    // debugger;
    sv && sv.scrollResponderScrollTo({ x: 328 * todayIndex });

    // todayIndex;
    // scrollView.current.scrollTo(todayIndex);
  }, [todayIndex, scrollView.current]);
  return (
    <View style={{ paddingVertical: 80 }} nativeID="schedule">
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
          find us this week
        </Heading>
        {schedule && (
          <View style={{ paddingTop: 60, position: 'relative' }}>
            <ScrollView
              horizontal
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ paddingBottom: 80 }}
              ref={scrollView}
            >
              {days}
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DaySchedule({ day, today }) {
  const { name, stops } = day;

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
        {name}
      </Heading>
      {stops.map(item => (
        <ScheduleItem
          style={{ marginBottom: 20 }}
          key={item.id}
          item={item}
          today={today}
        />
      ))}
    </View>
  );
}

function useWeekSchedule() {
  const data = useCloudValue('RestaurantSchedule');
  return data;
}

export default WeekSchedule;
