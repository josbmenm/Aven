import React from 'react';
import { View } from 'react-native';
import BaseText from '../dashboard-ui-deprecated/BaseText';
import ScheduleItem from './ScheduleItem';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';

function useSchedule() {
  const [schedule, setSchedule] = React.useState(null);
  React.useEffect(() => {
    setTimeout(() => {
      setSchedule([
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
      ]);
    }, 2000);
  }, []);

  return React.useMemo(() => schedule, [schedule]);
}

function Schedule({ withFloatingLabel = false, ...rest }) {
  const theme = useTheme();
  const schedule = useSchedule();

  return (
    <View {...rest}>
      {schedule && withFloatingLabel ? (
        <BaseText
          bold
          size="medium"
          className="hide-mobile"
          style={{
            position: 'absolute',
            top: 24,
            left: -120,
            fontFamily: theme.fonts.bold,
          }}
        >
          we're here!
        </BaseText>
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
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingBottom: 20,
          position: 'relative',
        },
        style,
      ]}
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
