import React from 'react';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme';
import CareerRoles from './CareerRoles';
import { Text, Heading, ButtonLink } from '../dash-ui';
import { useNavigation } from '../navigation-hooks/Hooks';

const breakpoints = [1024, 1400];

function CareerListingPage() {
  const theme = useTheme();
  const { getParam, navigate } = useNavigation();
  const roleId = getParam('roleId');
  const role = CareerRoles[roleId];
  if (!role) {
    return <Text>Role not found</Text>;
  }
  return (
    <GenericPage>
      <Heading title={role.roleName} />
      {role.renderContent()}
      <ButtonLink
        onPress={() => {
          navigate('CareerApply', { roleId });
        }}
        title="Apply Here"
      />
      <PageFooter />
    </GenericPage>
  );
}

CareerListingPage.navigationOptions = {
  title: 'Join Ono',
};

export default CareerListingPage;
