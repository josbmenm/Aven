import React, { useMemo } from 'react';
import Hero from '../../components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import LinkRow from '../../components/LinkRow';
import Row from '../../components/Row';
import Button from '../../components/Button';
import AdminSessionContainer from '../AdminSessionContainer';
import { useNavigation } from '../../navigation-hooks/Hooks';

import useCloud from '../../aven-cloud/useCloud';
import useObservable from '../../aven-cloud/useObservable';

function getRefs(cloud, name) {
  const refList = cloud.get(`${name}/_refs`);
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
      getRefs(cloud, 'Kiosk').map(kiosks => {
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

export default function HomeScreen() {
  const { navigate } = useNavigation();
  return (
    <AdminSessionContainer>
      <GenericPage>
        <Hero icon="🖥" title="Maui Host" />
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
    </AdminSessionContainer>
  );
}
