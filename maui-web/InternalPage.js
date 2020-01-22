import React from 'react';
import { TextInput, Stack, Page, Button, Text, Spacing } from '../dash-ui';
import { View } from 'react-native';
import OnoHomeLink from './OnoHomeLink';
import VisualButton from '../dashboard/VisualButton';
import FunctionalLink from '../navigation-web/Link';
import { useCloudClient, useStream } from '../cloud-core/KiteReact';
import { useTheme } from '../dashboard/Theme';

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
            borderBottomColor: active ? theme.colors.monsterra : 'transparent',
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
      <MenuLink routeName="InternalAccount" title="account" />
    </View>
  );
}
export default function InternalPage({ children }) {
  return (
    <Page>
      <Stack horizontal>
        <OnoHomeLink />
        <InternalMenu />
      </Stack>
      {children}
    </Page>
  );
}
