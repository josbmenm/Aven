import React from 'react';
import { useTheme, Stack, Page, Spacing } from '../dash-ui';
import { View } from 'react-native';
import OnoHomeLink from './OnoHomeLink';
import VisualButton from '../dashboard-ui-deprecated/VisualButton';
import FunctionalLink from '../navigation-web/Link';
import { useCloudClient, useStream } from '../cloud-core/KiteReact';

function MenuLink({
  title,
  buttonStyle,
  titleStyle,
  active,
  routeName,
  alternateActiveCheck,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      accesible="true"
      accessibilityRole="button"
      accessibilityLabel={title}
      alternateActiveCheck={alternateActiveCheck}
      renderContent={active => (
        <VisualButton
          title={title}
          type="outline"
          buttonStyle={{
            paddingHorizontal: 0,
            paddingVertical: 12,
            marginLeft: 32,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: 'transparent',
            borderBottomWidth: 3,
            borderBottomColor: active ? theme.colorPrimary : 'transparent',
            ...buttonStyle,
          }}
          titleStyle={{
            ...titleStyle,
          }}
          {...rest}
        />
      )}
    />
  );
}

function InternalMenu() {
  const client = useCloudClient();
  const clientState = useStream(client.clientState);
  if (!clientState || !clientState.session) {
    return null;
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <MenuLink routeName="InternalDashboard" title="dashboard" />
      <MenuLink routeName="InternalRestaurant" title="restaurant" />
      <MenuLink routeName="InternalMenu" title="menu" />
      <MenuLink
        routeName="InternalAccount"
        title={clientState.session.accountId}
      />
    </View>
  );
}
export default function InternalPage({ children }) {
  return (
    <Page>
      <Stack horizontal>
        <Spacing top={20}>
          {/* todo, spacing should move into link component without breaking the other header in GenericPage>MainMenu */}
          <OnoHomeLink />
        </Spacing>
        <InternalMenu />
      </Stack>
      {children}
    </Page>
  );
}
