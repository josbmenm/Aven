import React from 'react';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import CareerRoles from './CareerRoles';
import { View } from 'react-native';
import {
  Text,
  Heading,
  Spacing,
  ButtonLink,
  TextInput,
  TextArea,
  Stack,
  Button,
} from '../dash-ui';
import { useNavigation } from '../navigation-hooks/Hooks';
import { NarrowContainer } from '../dashboard/Container';
import { useCloud } from '../cloud-core/KiteReact';
import useFocus from '../navigation-hooks/useFocus';
import FileInput from '../aven-file-upload/FileInput';

function CareerListingPage() {
  const { getParam, navigate } = useNavigation();
  const roleId = getParam('roleId');
  const cloud = useCloud();
  const jobAppsDoc = cloud.docs.get('JobApplications');
  const role = CareerRoles[roleId];
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [linkedin, setLinkedin] = React.useState('');
  const [github, setGithub] = React.useState('');
  const [portfolio, setPortfolio] = React.useState('');
  const [files, setFiles] = React.useState(null);
  const [comments, setComments] = React.useState(null);
  function handleSubmit() {
    jobAppsDoc.putTransactionValue({
      type: 'JobApplication',
      roleId,
      phone,
      email,
      name,
      files,
      comments,
      github,
      linkedin,
      portfolio,
      roleId,
      role,
    });
  }

  const inputRenderers = [
    inputProps => (
      <TextInput
        key="key"
        label="full name"
        mode="name"
        onValue={setName}
        value={name}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        key="email"
        label="email address"
        mode="email"
        onValue={setEmail}
        value={email}
        {...inputProps}
      />
    ),
    inputProps => (
      <TextInput
        key="phone"
        label="phone number"
        mode="phone"
        onValue={setPhone}
        value={phone}
        {...inputProps}
      />
    ),
    <Spacing key="resume" top={60} bottom={60}>
      <FileInput
        uploadDoc={jobAppsDoc}
        label="resume/cv"
        value={files}
        onValue={setFiles}
      />
    </Spacing>,

    inputProps => (
      <TextInput
        key="linkedin"
        label="linkedin url"
        onValue={setLinkedin}
        value={linkedin}
        {...inputProps}
      />
    ),

    inputProps => (
      <TextInput
        key="github"
        label="github (optional)"
        onValue={setGithub}
        value={github}
        {...inputProps}
      />
    ),

    inputProps => (
      <TextInput
        key="portfolio"
        label="portfolio (optional)"
        onValue={setPortfolio}
        value={portfolio}
        {...inputProps}
      />
    ),
    inputProps => (
      <Spacing top={40} bottom={40}>
        <TextArea
          key="comments"
          label="comments or cover letter (optional)"
          onValue={setComments}
          value={comments}
          {...inputProps}
        />
      </Spacing>
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
      <NarrowContainer>
        <Spacing bottom={40}>
          <Heading
            theme={{ headingFontSize: 64 }}
            title={`Apply for ${role.roleName}`}
          />
        </Spacing>
        <Stack stretchInside>
          {inputs}
          <Spacing top={30} bottom={80}>
            <Button onPress={handleSubmit} title="submit" />
          </Spacing>
        </Stack>
      </NarrowContainer>
      <PageFooter />
    </GenericPage>
  );
}

CareerListingPage.navigationOptions = {
  title: 'Join Ono',
};

export default CareerListingPage;
