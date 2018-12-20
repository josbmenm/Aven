import React from 'react';
import useKioskName, { isStateUnloaded } from '../useKioskName';
import useCloud from '../../aven-cloud/useCloud';
import { Button, Text, View } from 'react-native';
import useObservable from '../../aven-cloud/useObservable';

export default function SummonHost() {
  let [kioskName] = useKioskName();
  const cloud = useCloud();
  const kioskRef = isStateUnloaded(kioskName)
    ? null
    : cloud.get(`Kiosk/${kioskName}`);
  const kioskState = useObservable(kioskRef && kioskRef.observeValue);
  if (!kioskRef) {
    return null;
  }
  if (kioskState && kioskState.isRequestingHost) {
    return (
      <View>
        <Text>A host will see you shortly</Text>
        <Button
          onPress={() => {
            kioskRef.transact(kioskState => ({
              ...kioskState,
              isRequestingHost: false,
            }));
          }}
          title="Cancel Summon"
        />
      </View>
    );
  }
  return (
    <Button
      onPress={() => {
        kioskRef.transact(kioskState => ({
          ...kioskState,
          isRequestingHost: true,
          hostRequestCount:
            kioskState && kioskState.hostRequestCount
              ? kioskState.hostRequestCount + 1
              : 1,
          hostRequestTime: Date.now(),
        }));
      }}
      title="Summon Host"
    />
  );
}
