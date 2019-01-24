import React, { useMemo } from 'react';
import Hero from '../../components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import LinkRow from '../../components/LinkRow';
import Row from '../../components/Row';
import Button from '../../components/Button';
import { useNavigation } from '../../navigation-hooks/Hooks';

import useCloud from '../../aven-cloud/useCloud';
import useObservable from '../../aven-cloud/useObservable';

function getDocs(cloud, name) {
  const refList = cloud.get(`${name}/_children`);
  return refList.expand((o, r) => {
    return (
      o &&
      o.map(childRefName => ({
        name: childRefName,
        state: cloud.get(`${name}/${childRefName}`),
      }))
    );
  });
}

function HostRequests() {
  const cloud = useCloud();
  const requests = useMemo(
    () =>
      getDocs(cloud, 'Kiosk').map(kiosks => {
        if (!kiosks) {
          return kiosks;
        }
        return kiosks
          .map(({ state, name }) => ({
            name,
            state,
            isRequestingHost: state && state.isRequestingHost,
            hostRequestTime: state && state.hostRequestTime,
          }))
          .filter(k => !!k.isRequestingHost);
      }),
    [cloud],
  );
  const currentRequests = useObservable(requests.observeValue);
  if (!currentRequests) {
    return null;
  }
  return (
    <RowSection>
      {currentRequests.map(kioskRequest => (
        <Row
          title={`Request from "${kioskRequest.name}" Kiosk`}
          key={kioskRequest.name}
        >
          <Button
            title="Clear"
            onPress={() => {
              cloud
                .get(`Kiosk/${kioskRequest.name}`)
                .transact(lastKioskState => ({
                  ...lastKioskState,
                  isRequestingHost: false,
                  hostRequestClearTime: Date.now(),
                }));
            }}
          />
        </Row>
      ))}
    </RowSection>
  );
}

export default function HomeScreen(props) {
  const { navigate } = useNavigation();
  return (
    <GenericPage {...props}>
      <Hero icon="📋" title="Ono Blends Host" />
      <HostRequests />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigate({ routeName: 'ManageOrders' });
          }}
          icon="🍽"
          title="Order Management"
        />
        <LinkRow
          onPress={() => {
            navigate({ routeName: 'ManageOrders' });
          }}
          icon="🍹"
          title="Make Free Blends"
        />
      </RowSection>
    </GenericPage>
  );
}

HomeScreen.navigationOptions = GenericPage.navigationOptions;
