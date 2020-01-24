import React from 'react';
import InternalPage from './InternalPage';
import { Heading, Text, Center, Spacing, useTheme } from '../dash-ui';
import {
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Text as RText,
} from 'react-native';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { useTargetPopover } from '../views/Popover';
import { prettyShadow } from '../components/Styles';

function MonthButton({ value, name, when, year, onWhen }) {
  const strMonth = String(value).padStart(2, '0');
  const monthWhen = `${year}-${strMonth}`;
  const isActive = when === monthWhen;
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        onWhen(monthWhen);
      }}
    >
      <View
        style={{
          margin: 4,
          borderRadius: 12,
          width: 192,
          backgroundColor: isActive ? theme.colorPrimary : undefined,
          alignItems: 'center',
        }}
      >
        <Text theme={{ colorForeground: isActive ? 'white' : '#555' }}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function MonthPicker({ when, onWhen }) {
  const matchedYear = when.match(/^\d\d\d\d/);
  const initYear = matchedYear ? matchedYear[0] : new Date().getFullYear();
  const [viewYear, setViewYear] = React.useState(initYear);
  const theme = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setViewYear(Number(viewYear) - 1);
          }}
        >
          <View style={{ width: 40, height: 40 }}>
            <svg width={40} height={40} style={{}}>
              <polygon points="10,20 24,12 24,28" fill={theme.colorPrimary} />
            </svg>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingTop: 10, alignItems: 'center' }}>
          <Text bold theme={{ fontSize: 20 }}>
            {viewYear}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setViewYear(Number(viewYear) + 1);
          }}
        >
          <View style={{ width: 40, height: 40 }}>
            <svg width={40} height={40} style={{}}>
              <polygon points="24,20 10,12 10,28" fill={theme.colorPrimary} />
            </svg>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {MONTH_NAMES.map((name, monthIndex) => (
          <MonthButton
            key={name}
            value={monthIndex + 1}
            name={name}
            when={when}
            year={viewYear}
            onWhen={onWhen}
          />
        ))}
      </View>
    </View>
  );
}

function extractYear(whenString) {
  const matchedYear = whenString.match(/^\d\d\d\d/);
  if (!matchedYear) return null;
  return matchedYear[0];
}
function extractMonth(whenString) {
  const matchedMonth = whenString.match(/^\d\d\d\d-(\d\d)/);
  if (!matchedMonth) return null;
  return matchedMonth[1];
}

function extractDate(whenString) {
  const matchedDate = whenString.match(/^\d\d\d\d-\d\d-(\d\d)/);
  if (!matchedDate) return null;
  return matchedDate[1];
}
function getDefaultYear() {
  return new Date().getFullYear();
}
function getDefaultMonth() {
  return new Date().getMonth() + 1;
}
function getDefaultDate() {
  return new Date().getDate();
}

function DayPicker({ when, onWhen }) {
  const initYear = extractYear(when) || getDefaultYear();
  const initMonth = extractMonth(when) || getDefaultMonth();
  const [viewYear, setViewYear] = React.useState(initYear);
  const [viewMonth, setViewMonth] = React.useState(initMonth);
  const theme = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (Number(viewMonth) === 1) {
              setViewYear(viewYear - 1);
              setViewMonth(12);
            } else {
              setViewMonth(viewMonth - 1);
            }
          }}
        >
          <View style={{ width: 40, height: 40 }}>
            <svg width={40} height={40} style={{}}>
              <polygon points="10,20 24,12 24,28" fill={theme.colorPrimary} />
            </svg>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingTop: 10, alignItems: 'center' }}>
          <Text bold theme={{ fontSize: 20 }}>
            {viewMonth} {viewYear}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (Number(viewMonth) === 12) {
              setViewYear(viewYear + 1);
              setViewMonth(1);
            } else {
              setViewMonth(viewMonth + 1);
            }
          }}
        >
          <View style={{ width: 40, height: 40 }}>
            <svg width={40} height={40} style={{}}>
              <polygon points="24,20 10,12 10,28" fill={theme.colorPrimary} />
            </svg>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {MONTH_NAMES.map((name, monthIndex) => (
          <MonthButton
            key={name}
            value={monthIndex + 1}
            name={name}
            when={when}
            year={viewYear}
            onWhen={onWhen}
          />
        ))}
      </View>
    </View>
  );
}

// Date.prototype.getWeekNumber = function(){
//   var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
//   var dayNum = d.getUTCDay() || 7;
//   d.setUTCDate(d.getUTCDate() + 4 - dayNum);
//   var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
//   return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
// };

function getMode(when) {
  console.log('inside getMode', when);
  if (when === 'today') return 'today';
  if (when === 'this-week') return 'this-week';
  if (when === 'this-month') return 'this-month';
  if (when === 'this-year') return 'this-year';
  if (when.match(/^\d\d\d\d$/)) return 'yearly';
  if (when.match(/^\d\d\d\d-Q\d$/)) return 'quarterly';
  if (when.match(/^\d\d\d\d-\d\d$/)) return 'monthly';
  if (when.match(/^\d\d\d\d-\d\d-\d\d$/)) return 'daily';
  if (when.match(/^\d\d\d\d-W\d\d$/)) return 'weekly';
  return 'today';
}

function WhenPicker({ mode, when, onWhen }) {
  if (mode === 'daily') return <DayPicker when={when} onWhen={onWhen} />;
  // if (mode === 'monthly')
  return <MonthPicker when={when} onWhen={onWhen} />;
}

function PillButton({ title, isActive, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          margin: 4,
          borderRadius: 12,
          backgroundColor: isActive ? theme.colorPrimary : undefined,
          alignItems: 'center',
        }}
      >
        <Text theme={{ colorForeground: isActive ? 'white' : '#555' }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const MODES = [
  {
    id: 'daily',
    name: 'Daily',
    onConvert: from => {
      let year = extractYear(from);
      let month = extractMonth(from);
      let date = extractDate(from);
      const defaultMonth = getDefaultMonth();
      const defaultYear = getDefaultYear();
      const defaultDate = getDefaultDate();
      if (!year) {
        year = defaultYear;
      }
      if (!month) {
        month = defaultMonth;
      }
      if (!date) {
        if (year == defaultYear && month == defaultMonth) {
          date = defaultDate;
        } else {
          date = 1;
        }
      }
      return `${year}-${month}-${String(date).padStart(2, '0')}`;
    },
  },
  { id: 'weekly', name: 'Weekly', onConvert: prev => prev },
  { id: 'monthly', name: 'Monthly', onConvert: prev => prev },
  { id: 'quarters', name: 'By Quarter', onConvert: prev => prev },
  { id: 'yearly', name: 'Yearly', onConvert: prev => prev },
];
function WhenModePicker({ mode, onMode }) {
  return (
    <React.Fragment>
      {MODES.map(m => (
        <PillButton
          isActive={mode === m.id}
          title={m.name}
          onPress={() => {
            onMode(m);
          }}
        />
      ))}
    </React.Fragment>
  );
}

function useDropdownView(renderPopoverContent) {
  const { onPopover, targetRef } = useTargetPopover(
    ({ onClose, location, openValue }) => {
      return (
        <Animated.View
          style={{
            position: 'absolute',
            ...prettyShadow,
            left: location.pageX,
            top: location.pageY + location.height,
            width: location.width,
            transform: [
              {
                scaleY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                translateY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, 0],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              opacity: openValue.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0, 1],
              }),
              backgroundColor: 'white',
              minHeight: 100,
            }}
          >
            {renderPopoverContent({ onClose })}
          </Animated.View>
        </Animated.View>
      );
    },
    { easing: Easing.inOut(Easing.poly(5)), duration: 500 },
  );
  return { onPopover, targetRef };
}

function WhenModeChanger({ mode, when, onWhen }) {
  const { onPopover, targetRef } = useDropdownView(({ onClose }) => (
    <WhenModePicker
      mode={mode}
      onMode={mode => {
        const newWhen = mode.onConvert(when);
        onWhen(newWhen);
        onClose();
      }}
    />
  ));
  return (
    <View style={{ borderBottomWidth: 1, borderColor: '#ccc' }} ref={targetRef}>
      <TouchableOpacity onPress={onPopover} style={{ flex: 1, width: 400 }}>
        <svg
          width={40}
          height={40}
          style={{ position: 'absolute', top: 36, left: 20 }}
        >
          <polygon points="12,12 0,0 24,0" fill="#aaa" />
        </svg>
        <Spacing horizontal={32} left={60} vertical={26}>
          <Text theme={{ fontSize: 24 }}>{mode}</Text>
        </Spacing>
      </TouchableOpacity>
    </View>
  );
}

function WhenSelector({ when, onWhen }) {
  const mode = getMode(when);
  console.log('whenselector', when, mode);
  const { onPopover, targetRef } = useTargetPopover(
    ({ onClose, location, openValue }) => {
      return (
        <Animated.View
          style={{
            position: 'absolute',
            ...prettyShadow,
            left: location.pageX,
            top: location.pageY + location.height,
            width: location.width,
            transform: [
              {
                scaleY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                translateY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, 0],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              opacity: openValue.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0, 1],
              }),
              backgroundColor: 'white',
            }}
          >
            <WhenModeChanger mode={mode} when={when} onWhen={onWhen} />
            <WhenPicker
              mode={mode}
              when={when}
              onWhen={w => {
                onClose();
                onWhen(w);
              }}
            />
          </Animated.View>
        </Animated.View>
      );
    },
    { easing: Easing.inOut(Easing.poly(5)), duration: 500 },
  );
  return (
    <View style={{ borderLeftWidth: 1, borderColor: '#ccc' }} ref={targetRef}>
      <TouchableOpacity onPress={onPopover} style={{ flex: 1, width: 400 }}>
        <svg
          width={40}
          height={40}
          style={{ position: 'absolute', top: 36, left: 20 }}
        >
          <polygon points="12,12 0,0 24,0" fill="#aaa" />
        </svg>
        <Spacing horizontal={32} left={60} top={26}>
          <Text theme={{ fontSize: 24 }}>{when}</Text>
        </Spacing>
      </TouchableOpacity>
    </View>
  );
}

const WHATS = [
  { id: 'revenue', name: 'Revenue' },
  { id: 'orders', name: 'Orders' },
  { id: 'uptime', name: 'Uptime' },
];

function WhatSelecor() {
  const { onPopover, targetRef } = useDropdownView(({ onClose }) => {
    return WHATS.map(w => (
      <PillButton
        title={w.name}
        isActive={false}
        onPress={() => {
          onClose();
        }}
      />
    ));
  });
  return (
    <View
      style={{
        borderRightWidth: 1,
        borderColor: '#ccc',
      }}
      ref={targetRef}
    >
      <TouchableOpacity onPress={onPopover} style={{ flex: 1, width: 400 }}>
        <Spacing horizontal={32} right={60} top={26}>
          <Text theme={{ fontSize: 24 }}>Revenue</Text>
        </Spacing>
        <svg
          width={40}
          height={40}
          style={{ position: 'absolute', top: 36, right: 20 }}
        >
          <polygon points="12,12 0,0 24,0" fill="#aaa" />
        </svg>
      </TouchableOpacity>
    </View>
  );
}

function isServer() {
  return !!process.env['NODE'];
}

function InternalDashboardPage() {
  const [when, setWhen] = React.useState('2020-01');
  if (isServer()) {
    return null;
  }
  return (
    <React.Fragment>
      <InternalPage />
      <AuthenticatedRedirectWrapper>
        <View
          style={{
            position: 'absolute',
            top: 120,
            bottom: 0,
            right: 0,
            left: 0,
          }}
        >
          <View
            style={{
              height: 80,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#ccc',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <WhatSelecor />
            <WhenSelector when={when} onWhen={setWhen} />
          </View>
          <View style={{ backgroundColor: '#f0f6ff', flex: 1 }}>
            <Center>
              <Spacing top={120}>
                <Heading title="Dashboard Coming Soon" />
              </Spacing>
            </Center>
          </View>
        </View>
      </AuthenticatedRedirectWrapper>
    </React.Fragment>
  );
}

InternalDashboardPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Dashboard',
  };
};

export default InternalDashboardPage;
