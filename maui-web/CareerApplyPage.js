import React from 'react';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import CareerRoles from './CareerRoles';
import { View } from 'react-native';
import { Text, Heading, ButtonLink, TextInput, Button } from '../dash-ui';
import { useNavigation } from '../navigation-hooks/Hooks';
import useFocus from '../navigation-hooks/useFocus';

function CareerListingPage() {
  const { getParam, navigate } = useNavigation();
  const roleId = getParam('roleId');
  const role = CareerRoles[roleId];
  function handleSubmit() {}
  const [token, setToken] = React.useState('');

  const inputRenderers = [
    inputProps => (
      <TextInput
        label="verification token"
        mode="code"
        maxLength={6}
        onValue={setToken}
        value={token}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });

  if (!role) {
    return <Text>Role not found</Text>;
  }
  return (
    <GenericPage>
      <Heading title={`${role.roleName} application`} />
      <View>{inputs}</View>
      <Button onPress={handleSubmit} title="Submit" />
      <PageFooter />
    </GenericPage>
  );
}

CareerListingPage.navigationOptions = {
  title: 'Join Ono',
};

export default CareerListingPage;
