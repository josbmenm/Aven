import React from 'react';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import { useSubsystemOverview } from '../ono-cloud/OnoKitchen';
import SimplePage from '../components/SimplePage';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useStream, useCloud } from '../cloud-core/KiteReact';
import DisconnectedPage from '../components/DisconnectedPage';

function Subsystems() {
  const subsystems = useSubsystemOverview();
  const navigation = useNavigation();
  return (
    <RowSection>
      {subsystems.map(system => (
        <LinkRow
          key={system.name}
          onPress={() => {
            navigation.navigate({
              routeName: 'KitchenEngSub',
              params: { system: system.name },
            });
          }}
          icon={system.icon}
          title={system.name}
          rightIcon={
            system.noFaults === null ? '' : system.noFaults ? '👍' : '🚨'
          }
        />
      ))}
    </RowSection>
  );
}

export default function KitchenEngScreen({ ...props }) {
  const cloud = useCloud();
  const isConnected = useStream(cloud.connected);
  return (
    <SimplePage
      {...props}
      title="Kitchen Engineering"
      icon="🛠"
      disableScrollView={!isConnected}
    >
      {isConnected ? <Subsystems /> : <DisconnectedPage />}
    </SimplePage>
  );
}

KitchenEngScreen.navigationOptions = SimplePage.navigationOptions;
