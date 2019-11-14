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
  const schedule = useWeekSchedule();
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
    sv && sv.scrollResponderScrollTo({ x: 300 * todayIndex - 20 });
  }, [todayIndex, scrollView.current]);
  return (
    <View style={{ paddingVertical: 80 }} nativeID="schedule">
      <Container fullWidth>
        <Heading
          size="small"
          style={{ textAlign: 'center', alignSelf: 'center' }}
        >
          find us this week
        </Heading>
        {schedule && (
          <View style={{ paddingTop: 60, position: 'relative' }}>
            <ScrollView horizontal style={{}} ref={scrollView}>
              {days}
            </ScrollView>
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
          width: 280,
          padding: 20,
          paddingBottom: 40,
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
