import React from 'react';
import InternalPage from './InternalPage';
import {
  Heading,
  SmallHeading,
  Text,
  AsyncButton,
  Button,
  useKeyboardPopover,
  Spinner,
  useTheme,
  Spacing,
  Stack,
  TextInput,
  DateTimeInput,
  Tag,
} from '../dash-ui';
import { ScrollView, View } from 'react-native';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { prettyShadowSmall } from '../components/Styles';
import { createSwitchNavigator } from '../navigation-core';
import FunctionalLink from '../navigation-web/Link';
import { useNavigation } from '../navigation-hooks/Hooks';
import useFocus from '../navigation-hooks/useFocus';
import {
  useCloudValue,
  useCloud,
  useStream,
  CloudContext,
} from '../cloud-core/KiteReact';
import AirtableImage from '../components/AirtableImage';

function SidebarLink({ label, routeName, isActive }) {
  return (
    <FunctionalLink routeName={routeName}>
      <View
        style={{
          backgroundColor: isActive ? '#f0f9fc' : null,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text theme={{ fontSize: 28 }}>{label}</Text>
      </View>
    </FunctionalLink>
  );
}

function MauiConfig({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Heading title="Maui Config" />
    </View>
  );
}

function DropSpotForm({ onSubmit, initialValue }) {
  const [name, setName] = React.useState(
    (initialValue && initialValue.name) || '',
  );
  const [location, setLocation] = React.useState(
    (initialValue && initialValue.location) || '',
  );
  async function handleSubmit() {
    await onSubmit({ name, location });
  }
  const inputRenderers = [
    inputProps => (
      <TextInput
        label="name"
        mode="name"
        onValue={setName}
        value={name}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        label="location"
        mode="name"
        onValue={setLocation}
        value={location}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <View style={{}}>
      {inputs}
      <AsyncButton title="submit" onPress={handleSubmit} />
    </View>
  );
}

function NewDropForm({ spotId, onClose }) {
  const actionsDoc = useCloud().get('Drops/ScheduleActions');
  async function onSubmit(drop) {
    console.log('neww wdrop[', spotId, drop);
    actionsDoc.putTransactionValue({
      type: 'ScheduleDrop',
      drop: {
        spotId,
        time: Date.now(),
        orderWindowDuration: 60,
        targetDeliveryDuration: 15,
        publicDeliveryDuration: 25,
      },
    });
    onClose();
  }
  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');
  async function handleSubmit() {
    await onSubmit({ name, location });
  }
  const inputRenderers = [
    inputProps => (
      <TextInput
        label="last call date+time- end of order window"
        mode="name"
        onValue={setName}
        value={name}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        label="order window duration (minutes)"
        mode="name"
        onValue={setLocation}
        value={location}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        label="target delivery duration (minutes)"
        mode="name"
        onValue={setLocation}
        value={location}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        label="public delivery duration (minutes)"
        mode="name"
        onValue={setLocation}
        value={location}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <View style={{}}>
      {inputs}
      <AsyncButton title="submit" onPress={handleSubmit} />
    </View>
  );
}

function NewDropSpotForm({ onClose, navigation }) {
  const dropSpots = useCloud().get('DropSpots');
  const { navigate } = useNavigation();
  return (
    <DropSpotForm
      initialValue={{}}
      onSubmit={async spotConfig => {
        const newSpot = dropSpots.children.post();
        newSpot.putValue(spotConfig).then(result => {
          navigate('DropSpot', { spotId: newSpot.getName() });
        });
        onClose();
      }}
    />
  );
}

function EditDropSpotForm({ onClose, initialSpotValue, spotId }) {
  const dropSpots = useCloud().get('DropSpots');

  return (
    <DropSpotForm
      initialValue={initialSpotValue}
      onSubmit={async spotConfig => {
        const dropSpot = dropSpots.children.get(spotId);
        dropSpot.putValue(spotConfig).then(result => {
          console.log('saved it!!');
        });
        onClose();
      }}
    />
  );
}

function SpotLink({ spotId, spotDoc }) {
  const spotValue = useStream(spotDoc.value);
  return (
    <FunctionalLink routeName="DropSpotDetails" params={{ spotId }}>
      <View
        style={{
          paddingHorizontal: 32,
          paddingVertical: 8,
          flexDirection: 'row',
        }}
      >
        <Text
          theme={{
            fontSize: 22,
            colorForeground: spotValue ? undefined : '#999',
          }}
        >
          {spotValue ? spotValue.name : spotId}
        </Text>
        <Text theme={{ fontSize: 22, colorForeground: '#777' }}>
          {' '}
          - {spotValue && spotValue.location}
        </Text>
      </View>
    </FunctionalLink>
  );
}

function ListGroup({ children }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        marginVertical: 32,
        ...prettyShadowSmall,
      }}
    >
      {children}
    </View>
  );
}

function DropSpotEditorIndex({ navigation }) {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <NewDropSpotForm onClose={onClose} navigation={navigation} />
  ));
  const cloud = useCloud();
  const dropSpots = cloud.get('DropSpots');
  const spotList = useStream(dropSpots.children.all);
  return (
    <View style={{ flex: 1 }}>
      <Heading title="Drop Spots" />
      <ListGroup>
        {spotList &&
          Object.entries(spotList).map(([spotId, spotDoc]) => {
            return <SpotLink key={spotId} spotId={spotId} spotDoc={spotDoc} />;
          })}
      </ListGroup>
      <Stack horizontal inline>
        <Button title="new drop spot.." onPress={onPopover} />
      </Stack>
    </View>
  );
}

function SpotDetails({ spotDoc, spotId }) {
  const spotValue = useStream(spotDoc.value);
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <EditDropSpotForm
      initialSpotValue={spotValue}
      spotId={spotId}
      onClose={onClose}
    />
  ));
  if (!spotValue) {
    return <Spinner />;
  }
  return (
    <View style={{ flexDirection: 'row', marginBottom: 60 }}>
      <View style={{ flex: 1 }}>
        <Heading title={spotValue.name} />
        <Text>{spotValue.location}</Text>
      </View>
      <Button title="edit" onPress={onPopover} />
    </View>
  );
}

function DropScheduleRow({ drop, spotValue }) {
  const cloud = useCloud();
  let realSpotValue = useCloudValue(
    spotValue || cloud.get(`DropSpots/${drop.spotId}`),
  );
  return (
    <View
      style={{
        paddingHorizontal: 32,
        paddingVertical: 8,
        flexDirection: 'row',
      }}
    >
      <Text
        theme={{
          fontSize: 22,
          colorForeground: spotValue ? undefined : '#999',
        }}
      >
        {realSpotValue && realSpotValue.name}
      </Text>
    </View>
  );
}

function SpotDropSchedule({ schedule, spotValue }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        marginVertical: 32,
        ...prettyShadowSmall,
      }}
    >
      {schedule.scheduled.map(drop => (
        <DropScheduleRow key={drop.id} drop={drop} spotValue={spotValue} />
      ))}
    </View>
  );
}

function SpotDrops({ spotDoc, spotId }) {
  const spotValue = useStream(spotDoc.value);
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <NewDropForm spotId={spotId} onClose={onClose} />
  ));
  const scheduleValue = useCloudValue(`DropSpotSchedule/${spotId}`);
  if (!spotValue) {
    return null;
  }
  return (
    <View style={{}}>
      <SmallHeading title={`Upcoming drops at ${spotValue.name}`} />
      {scheduleValue && (
        <SpotDropSchedule schedule={scheduleValue} spotValue={spotValue} />
      )}
      <Stack horizontal inline>
        <Button title={`new drop at ${spotValue.name}`} onPress={onPopover} />
      </Stack>
    </View>
  );
}

function DropMenuRow({ isEnabled, onToggle, name, image }) {
  return (
    <View
      style={{
        padding: 8,
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
      }}
    >
      <AirtableImage
        image={image}
        style={{ width: 120, height: 140, alignSelf: 'center' }}
      />
      <View style={{ flex: 1 }}>
        <Text center theme={{ fontSize: 18 }}>
          {name}
        </Text>
      </View>

      <Spacing horizontal={16}>
        {isEnabled ? (
          <Tag title="Enabled" status="positive" />
        ) : (
          <Tag title="Not Enabled" status="warning" />
        )}
      </Spacing>
      <Button title={isEnabled ? 'disable' : 'enable'} onPress={onToggle} />
    </View>
  );
}

function SpotMenu({ spotDoc, spotId }) {
  const spotValue = useStream(spotDoc.value);
  const companyConfig = useCloudValue('CompanyConfig');
  if (!spotValue || !companyConfig) {
    return null;
  }
  const enabledMenu = spotValue.enabledMenu || [];
  const { KioskBlendMenu, KioskFoodMenu, Recipes } = companyConfig.baseTables;

  console.log({ KioskBlendMenu, KioskFoodMenu, Recipes });
  return (
    <View>
      <SmallHeading title="Edit Spot Menu" />
      <View style={{}}>
        {Object.values(KioskBlendMenu).map(menuItem => {
          const recipe = menuItem.Recipe && Recipes[menuItem.Recipe[0]];
          const isEnabled = enabledMenu.indexOf(menuItem.id) !== -1;
          return (
            <DropMenuRow
              isEnabled={isEnabled}
              name={menuItem['Display Name']}
              image={recipe && recipe['Recipe Image']}
              onToggle={() => {
                spotDoc.putValue({
                  ...spotValue,
                  enabledMenu: isEnabled
                    ? enabledMenu.filter(a => a !== menuItem.id)
                    : [...enabledMenu, menuItem.id],
                });
              }}
            />
          );
        })}
      </View>
      <View style={{}}>
        {Object.values(KioskFoodMenu).map(menuItem => {
          const isEnabled = enabledMenu.indexOf(menuItem.id) !== -1;
          return (
            <DropMenuRow
              isEnabled={isEnabled}
              onToggle={() => {
                spotDoc.putValue({
                  ...spotValue,
                  enabledMenu: isEnabled
                    ? enabledMenu.filter(a => a !== menuItem.id)
                    : [...enabledMenu, menuItem.id],
                });
              }}
              name={menuItem['Name']}
              image={menuItem && menuItem.Photo}
            />
          );
        })}
      </View>
    </View>
  );
}

function DropSpotSingle({ navigation }) {
  const spotId = navigation.getParam('spotId');
  const cloud = useCloud();
  const theme = useTheme();
  const spotDoc = cloud.get('DropSpots').children.get(spotId);
  return (
    <View style={{ flex: 1 }}>
      <Stack horizontal inline>
        <Button
          title="< All Drop Spots"
          outline
          onPress={() => {
            navigation.navigate('DropSpotsIndex');
          }}
        />
      </Stack>
      <SpotDetails spotDoc={spotDoc} spotId={spotId} />
      <DateTimeInput value={undefined} />
      <SpotDrops spotDoc={spotDoc} spotId={spotId} />
      <SpotMenu spotDoc={spotDoc} spotId={spotId} />
      <Spacing top={80}>
        <Stack horizontal inline>
          <AsyncButton
            theme={{
              colorPrimary: theme.colorNegative,
            }}
            title="Delete Drop Spot"
            onPress={async () => {
              await spotDoc.destroy();
              navigation.navigate('DropSpotsIndex');
            }}
          />
        </Stack>
      </Spacing>
    </View>
  );
}
const DropSpotEditor = createSwitchNavigator({
  DropSpotsIndex: {
    path: '',
    screen: DropSpotEditorIndex,
  },
  DropSpotDetails: {
    path: ':spotId',
    screen: DropSpotSingle,
  },
});

function DropEditor({ navigation }) {
  const dropSchedule = useCloudValue('DropSchedule');
  return (
    <View style={{ flex: 1 }}>
      <Heading title="Drops" />
      {dropSchedule &&
        dropSchedule.scheduled.map(drop => <DropScheduleRow drop={drop} />)}
      <Spacing top={40}>
        <Stack horizontal inline>
          <Button title="schedule new drop" onPress={() => {}} />
        </Stack>
      </Spacing>
    </View>
  );
}

function createSidebarPage(routeConfigs) {
  const SwitchNavigator = createSwitchNavigator(routeConfigs);

  function SidebarPage({ navigation, ...props }) {
    const { state } = navigation;
    const activeRouteName = state.routes[state.index].routeName;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch', flex: 1 }}>
        <View
          style={{
            width: 400,
            marginRight: 32,
            marginVertical: 32,
            ...prettyShadowSmall,
          }}
        >
          {Object.entries(routeConfigs).map(([routeName, routeConfig]) => {
            return (
              <SidebarLink
                label={routeConfig.sidebarLabel}
                routeName={routeName}
                isActive={routeName === activeRouteName}
              />
            );
          })}
        </View>
        <SwitchNavigator navigation={navigation} {...props} />
      </View>
    );
  }

  SidebarPage.router = SwitchNavigator.router;
  return SidebarPage;
}

const RestaurantSidebarPage = createSidebarPage({
  MauiConfig: {
    path: 'maui',
    screen: MauiConfig,
    sidebarLabel: '🍹 Maui Config',
  },
  DropSpots: {
    path: 'spots',
    screen: DropSpotEditor,
    sidebarLabel: '🎯 Drop Spots',
  },
  Drops: {
    path: 'drops',
    screen: DropEditor,
    sidebarLabel: '⏰ Schedule Drops',
  },
});

function InternalRestaurantPage({ navigation, ...props }) {
  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <RestaurantSidebarPage navigation={navigation} {...props} />
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

InternalRestaurantPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Restaurant',
  };
};
InternalRestaurantPage.router = RestaurantSidebarPage.router;

export default InternalRestaurantPage;
