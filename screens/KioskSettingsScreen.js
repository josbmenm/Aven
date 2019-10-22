import React from 'react';

import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import Button from '../components/Button';
import AppInfoText from '../components/AppInfoText';
import { useCloud } from '../cloud-core/KiteReact';
import codePush from 'react-native-code-push';

import Row from '../components/Row';
import Tag from '../components/Tag';
import useAsyncError from '../react-utils/useAsyncError';

import MultiSelect from '../components/MultiSelect';
import { useRestaurantConfig } from '../logic/RestaurantConfig';
import { useRestaurantState } from '../ono-cloud/Kitchen';

function UpdateAirtableRow() {
  const cloud = useCloud();
  return (
    <LinkRow
      onPress={() => {
        cloud
          .dispatch({ type: 'UpdateAirtable' })
          .then(() => {
            alert('Airtable Update Started. Usually takes ~2 minutes..');
          })
          .catch(e => {
            console.error(e);
            alert('Error updating Airtable!');
          });
      }}
      icon="♻️"
      title="Update Airtable"
    />
  );
}

function CateringMode() {
  const restaurantConfig = useRestaurantConfig();
  const isCateringMode =
    !!restaurantConfig && restaurantConfig.mode === 'catering';
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="catering mode">
      <Tag
        title={isCateringMode ? 'Free Blends' : 'Regular Mode'}
        color={isCateringMode ? Tag.warningColor : Tag.positiveColor}
      />
      <MultiSelect
        options={[
          { name: 'Catering', value: true },
          { name: 'Regular', value: false },
        ]}
        value={isCateringMode}
        onValue={value => {
          handleError(
            cloud.get('RestaurantConfig').transact(config => ({
              ...config,
              mode: value ? 'catering' : 'regular',
            })),
          );
        }}
      />
    </Row>
  );
}

function AlarmFakeButtons() {
  const [state, dispatch] = useRestaurantState();

  return (
    <React.Fragment>
      <Button
        title="Temp"
        onPress={() => {
          dispatch({
            type: 'SetAlarm',
            alarmType: 'FreezerTemp',
          });
        }}
      />
    </React.Fragment>
  );
}

function AlarmMode() {
  const [state, dispatch] = useRestaurantState();
  const isMuteAlarms = !!state && !!state.isMutingAlarms;
  const handleError = useAsyncError();
  return (
    <Row title="disable restaurant alarms">
      <Tag
        title={isMuteAlarms ? 'Alarms Disabled' : 'Alarms Enabled'}
        color={isMuteAlarms ? Tag.warningColor : Tag.positiveColor}
      />
      <MultiSelect
        options={[
          { name: 'Disable', value: true },
          { name: 'Regular Operation', value: false },
        ]}
        value={isMuteAlarms}
        onValue={value => {
          handleError(
            dispatch({
              type: 'SetAlarmMute',
              isMutingAlarms: value,
            }),
          );
        }}
      />
      {isMuteAlarms && false && <AlarmFakeButtons />}
    </Row>
  );
}

export default function KioskSettingsScreen({ navigation, ...props }) {
  return (
    <SimplePage {...props} navigation={navigation} hideBackButton>
      <CateringMode />
      <AlarmMode />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'FeedbackApp' });
          }}
          icon="💬"
          title="Feedback App"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'DeviceManager' });
          }}
          icon="📱"
          title="Restaurant Devices"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'ComponentPlayground' });
          }}
          icon="🧱"
          title="Component Playground"
        />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'PaymentDebug' });
          }}
          icon="💸"
          title="Card Reader Connection"
        />
        <LinkRow
          onPress={() => {
            throw new Error('User-forced error!');
          }}
          icon="⚠️"
          title="Test App Error"
        />
        <LinkRow
          onPress={() => {
            console.error('User-forced soft error!');
          }}
          icon="⚠️"
          title="Test Soft Error"
        />
        <LinkRow
          onPress={() => {
            codePush.restartApp();
          }}
          icon="♻️"
          title="Refresh App"
        />

        <UpdateAirtableRow />
      </RowSection>
      <AppInfoText />
    </SimplePage>
  );
}

KioskSettingsScreen.navigationOptions = SimplePage.navigationOptions;
