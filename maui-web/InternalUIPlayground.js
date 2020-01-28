import React from 'react';
import InternalPage from './InternalPage';
import { Heading, Button } from '../dash-ui';
import { View } from 'react-native';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { useTheme } from '../dash-ui';
import VisualButton from '../dashboard/VisualButton';
import FunctionalLink from '../navigation-web/Link';

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

function UIPlaygroundPage() {
  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ maxWidth: 300, flex: 1, backgroundColor: 'blue' }}>
            {/* <MenuLink  */}
            <Button onPress={() => {}} title="Zomg" />
          </View>
          <View style={{ flex: 1 }}>
            <Heading title="Restaurant Coming Soon" />
          </View>
        </View>
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

UIPlaygroundPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Restaurant',
  };
};

export default UIPlaygroundPage;
