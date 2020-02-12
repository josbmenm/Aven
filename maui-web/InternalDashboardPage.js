import React from 'react';
import InternalPage from './InternalPage';
import {
  Heading,
  Text,
  Center,
  Spacing,
  Button,
  AsyncButton,
  Stack,
  useTheme,
  DatePicker,
  useKeyboardPopover,
  useDropdownView,
} from '../dash-ui';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import {
  TouchableOpacity,
  View,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { useTargetPopover } from '../views/Popover';
import { prettyShadow } from '../components/Styles';
import formatCurrency from '../utils/formatCurrency';
import formatTime from '../utils/formatTime';
import { useNavigation } from '../navigation-hooks/Hooks';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBar,
  VictoryLabel,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryTheme,
} from 'victory';
import onoVictoryTheme from './onoVictoryTheme';

function HalfPillButton({ isActive, name, onPress }) {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
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

function MonthButton({ value, name, when, year, onWhen }) {
  const strMonth = String(value).padStart(2, '0');
  const monthWhen = `${year}-${strMonth}`;
  const isActive = when === monthWhen;
  return (
    <HalfPillButton
      onPress={() => {
        onWhen(monthWhen);
      }}
      name={name}
      isActive={isActive}
    />
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
  const y = new Date().getFullYear();
  return String(y);
}
function getDefaultMonth() {
  const m = new Date().getMonth() + 1;
  return String(m).padStart(2, '0');
}
function getDefaultDate() {
  const d = new Date().getDate();
  return String(d).padStart(2, '0');
}

// Date.prototype.getWeekNumber = function(){
//   var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
//   var dayNum = d.getUTCDay() || 7;
//   d.setUTCDate(d.getUTCDate() + 4 - dayNum);
//   var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
//   return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
// };

function getMode(when) {
  if (when === 'today') return 'today';
  if (when === 'this-week') return 'this-week';
  if (when === 'this-month') return 'this-month';
  if (when === 'this-year') return 'this-year';
  if (when.match(/^\d\d\d\d$/)) return 'yearly';
  if (when.match(/^\d\d\d\d-Q\d$/)) return 'quarters';
  if (when.match(/^\d\d\d\d-\d\d?$/)) return 'monthly';
  if (when.match(/^\d\d\d\d-\d\d?-\d\d?$/)) return 'daily';
  if (when.match(/^\d\d\d\d-W\d\d$/)) return 'weekly';
  return 'monthly';
}

function WeekPicker({ when, onWhen }) {
  // start by copying day picker.. or refactor the gross parts of it
  return null;
}
function QuarterPicker({ when, onWhen }) {
  const matchedYear = when.match(/^\d\d\d\d/);
  const matchedQ = when.match(/^\d\d\d\d-Q(\d)$/);

  const activeYear = matchedYear ? matchedYear[0] : new Date().getFullYear();
  const [viewYear, setViewYear] = React.useState(activeYear);
  let activeQ = null;
  if (viewYear === activeYear && matchedQ) {
    activeQ = Number(matchedQ[1]);
  }
  activeQ;
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
        {[1, 2, 3, 4].map(q => (
          <HalfPillButton
            onPress={() => {
              onWhen(`${viewYear}-Q${q}`);
            }}
            name={`Q${q}`}
            isActive={activeQ === q}
          />
        ))}
      </View>
    </View>
  );
}
function YearPicker({ when, onWhen }) {
  const matchedYear = when.match(/^\d\d\d\d/);
  const year = matchedYear ? matchedYear[0] : new Date().getFullYear();
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
            onWhen(String(Number(year) - 1));
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
            {year}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            onWhen(String(Number(year) + 1));
          }}
        >
          <View style={{ width: 40, height: 40 }}>
            <svg width={40} height={40} style={{}}>
              <polygon points="24,20 10,12 10,28" fill={theme.colorPrimary} />
            </svg>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WhenPicker({ initialWhen, onWhen, onComplete }) {
  const [when, setWhen] = React.useState(initialWhen);
  const mode = getMode(when);
  function handleWhen(w) {
    onWhen(w);
    setWhen(w);
    onComplete();
  }
  // if (mode === 'monthly') ...
  let Picker = MonthPicker;
  if (mode === 'daily') {
    Picker = DatePicker;
  } else if (mode === 'weekly') {
    Picker = WeekPicker;
  } else if (mode === 'quarters') {
    Picker = QuarterPicker;
  } else if (mode === 'yearly') {
    Picker = YearPicker;
  }
  return (
    <React.Fragment>
      <WhenModeChanger
        mode={mode}
        when={when}
        onWhen={w => {
          setWhen(w);
          onWhen(w);
        }}
      />
      <Picker when={when} onWhen={handleWhen} />
    </React.Fragment>
  );
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
        if (year === defaultYear && month === defaultMonth) {
          date = defaultDate;
        } else {
          date = 1;
        }
      }
      return `${year}-${month}-${date}`;
    },
  },
  {
    id: 'weekly',
    name: 'Weekly',
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
      return `${year}-W00`;
    },
  },
  {
    id: 'monthly',
    name: 'Monthly',
    onConvert: from => {
      let year = extractYear(from);
      let month = extractMonth(from);
      const defaultMonth = getDefaultMonth();
      const defaultYear = getDefaultYear();
      if (!year) {
        year = defaultYear;
      }
      if (!month) {
        month = defaultMonth;
      }
      return `${year}-${month}`;
    },
  },
  {
    id: 'quarters',
    name: 'By Quarter',
    onConvert: from => {
      let year = extractYear(from);
      let month = extractMonth(from);
      const defaultMonth = getDefaultMonth();
      const defaultYear = getDefaultYear();
      if (!year) {
        year = defaultYear;
      }
      if (!month) {
        month = defaultMonth;
      }
      const q = 1 + Math.floor(month / 4);
      return `${year}-Q${q}`;
    },
  },
  {
    id: 'yearly',
    name: 'Yearly',
    onConvert: from => {
      let year = extractYear(from);
      const defaultYear = getDefaultYear();
      if (!year) {
        year = defaultYear;
      }
      return `${year}`;
    },
  },
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
            <WhenPicker
              mode={mode}
              initialWhen={when}
              onWhen={onWhen}
              onComplete={onClose}
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
  // { id: 'uptime', name: 'Uptime' },
];

function WhatSelecor({ what, onWhat }) {
  const { onPopover, targetRef } = useDropdownView(({ onClose }) => {
    return WHATS.map(w => (
      <PillButton
        title={w.name}
        isActive={w.id === what}
        onPress={() => {
          onWhat(w.id);
          onClose();
        }}
      />
    ));
  });
  const activeWhat = WHATS.find(w => w.id === what);
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
          <Text theme={{ fontSize: 24 }}>{activeWhat.name}</Text>
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

function CustomLabel(props) {
  const { revenue } = props.datum;
  return (
    <VictoryLabel
      {...props}
      text={`$${Math.floor(revenue / 100)}.${String(revenue % 100).padStart(
        2,
        '0',
      )}`}
    />
  );
}
function CustomTooltip(props) {
  return (
    <g>
      <VictoryTooltip
        {...props}
        labelComponent={<CustomLabel />}
        flyoutStyle={{
          fill: '#fff',
          // boxShadow: '0px 0px 22px 10px #00000008',
          pointerEvents: 'none',
          strokeWidth: 1,
          strokeOpacity: 0.3,
        }}
      />
    </g>
  );
}
CustomTooltip.defaultEvents = VictoryTooltip.defaultEvents;

function OrderPopover({ orderId, onClose }) {
  const orderValue = useCloudValue(`OrderState/${orderId}`);
  const cloud = useCloud();
  if (!orderValue) return null;
  console.log(orderValue);

  return (
    <View style={{ maxWidth: 600 }}>
      <Heading
        title={`Order for ${orderValue.orderName.firstName} ${orderValue.orderName.lastName}`}
      />
      <Text>Order #{orderId}</Text>
      <Text>{formatTime(orderValue.confirmedTime)}</Text>
      {orderValue.refundTime ? (
        <Text>
          This order was refunded at {formatTime(orderValue.refundTime)}
        </Text>
      ) : (
        <AsyncButton
          title="Refund Order"
          onPress={async () => {
            await cloud.dispatch({ type: 'RefundOrder', orderId });
          }}
        />
      )}
    </View>
  );
}

function downloadCSVData(dataStr, name) {
  let csvContent = 'data:text/csv;charset=utf-8,' + dataStr;

  var encodedUri = encodeURI(csvContent);
  var link = window.document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name + '.csv');
  window.document.body.appendChild(link); // Required for FF

  link.click();
}

function downloadJSONData(data, name) {
  const dataStr = JSON.stringify(data);
  let content = 'data:application/json;charset=utf-8,' + dataStr;

  var encodedUri = encodeURI(content);
  var link = window.document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name + '.json');
  window.document.body.appendChild(link); // Required for FF

  link.click();
}

function useOrderPopover(orderId) {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <OrderPopover orderId={orderId} onClose={onClose} />
  ));
  return { onOpenOrder: onPopover };
}

function DashboardContentContainer({
  children,
  onInnerLayout,
  scroll = false,
  rawData,
  onCSVData,
  title,
  totals,
}) {
  const OuterView = scroll ? ScrollView : View;
  return (
    <React.Fragment>
      <OuterView style={{ flex: 1, backgroundColor: lightBgColor }}>
        <View onLayout={onInnerLayout} style={{ flex: 1, margin: 50 }}>
          {children}
        </View>
      </OuterView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingBottom: 14,
          paddingHorizontal: 50,
          borderTopWidth: 1,
          borderColor: '#ccc',
          backgroundColor: lightBgColor,
        }}
      >
        <View>
          <Stack horizontal inline>
            {rawData && (
              <Button
                title="download raw JSON"
                onPress={() => {
                  downloadJSONData(rawData, title);
                }}
              />
            )}
            {onCSVData && (
              <Button
                title="download CSV"
                onPress={() => {
                  downloadCSVData(onCSVData(), title);
                }}
              />
            )}
          </Stack>
        </View>
        <View>{totals && <Text>{JSON.stringify(totals)}</Text>}</View>
      </View>
    </React.Fragment>
  );
}

function DataView({ what, when }) {
  if (what === 'revenue') {
    return <RevenueView when={when} />;
  } else if (what === 'orders') {
    return <OrdersView when={when} />;
  }
  return <Heading title="Coming Soon" />;
}
function formatFullTime(timeNumber) {
  const d = new Date(timeNumber);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
function OrderView({ order }) {
  const { onOpenOrder } = useOrderPopover(order.orderId);
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        flexAlign: 'space-between',
        alignSelf: 'stretch',
      }}
      onPress={onOpenOrder}
    >
      <Text>{order.name}</Text>
      <Stack horizontal inline>
        <Text>{formatCurrency(order.total)}</Text>
        <Text>{formatFullTime(order.time)}</Text>
      </Stack>
    </TouchableOpacity>
  );
}

const lightBgColor = '#f5f8fe';
function extractCSVFields(dataList, fieldNames) {
  return [];
}
function OrdersView({ when }) {
  const data = useCloudValue(`OrdersWhen/${when}`);
  if (!data) {
    return <Heading>Loading..</Heading>;
  }
  return (
    <DashboardContentContainer
      scroll
      rawData={data}
      onCSVData={() => {
        return extractCSVFields(data, ['orderId', 'time']);
      }}
      title={`orders-${when}`}
      totals={data.totals}
    >
      <Heading title={`${data.orders.length} orders`} />
      {data.orders.map(order => (
        <OrderView order={order} />
      ))}
    </DashboardContentContainer>
  );
}

function RevenueView({ when }) {
  const data = useCloudValue(`RevenueWhen/${when}`);
  const [layout, setLayout] = React.useState(null);
  if (!data) {
    return <Heading>Loading..</Heading>;
  }
  return (
    <DashboardContentContainer
      rawData={data}
      onInnerLayout={e => {
        setLayout(e.nativeEvent.layout);
      }}
      style={{ flex: 1, margin: 50 }}
      title={`revenue-${when}`}
      totals={data.totals}
    >
      <VictoryChart
        theme={onoVictoryTheme}
        // theme={VictoryTheme.grayscale}
        containerComponent={<VictoryVoronoiContainer theme={onoVictoryTheme} />}
        width={layout && layout.width}
        height={layout && layout.height}
      >
        <VictoryLine
          interpolation="monotoneX"
          style={{
            // data: { stroke: '#c43a31' },
            parent: { border: '1px solid #ccc' },
          }}
          labelComponent={<CustomTooltip />}
          labels={({ datum }) => {
            return { y: datum.revenue };
          }}
          data={data.intervals.map(interval => {
            return {
              x: interval.time,
              y: interval.revenue / 100 || 0,
              ...interval,
            };
          })}
        />
        <VictoryAxis label="$" dependentAxis />
        <VictoryAxis label="Day" />
      </VictoryChart>
    </DashboardContentContainer>
  );
}

function InternalDashboardPage() {
  const { getParam, setParams } = useNavigation();
  const d = new Date();
  const defaultWhen = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}`;
  const when = getParam('when') || defaultWhen;
  const what = getParam('what') || 'revenue';
  function setWhen(w) {
    setParams({ when: w });
  }
  function setWhat(w) {
    setParams({ what: w });
  }
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
            <WhatSelecor what={what} onWhat={setWhat} />
            <WhenSelector when={when} onWhen={setWhen} />
          </View>
          <DataView what={what} when={when} />
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
