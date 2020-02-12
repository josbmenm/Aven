import React from 'react';
import View from '../views/View';
import Heading from '../dashboard-ui-deprecated/Heading';
import BaseText from '../dashboard-ui-deprecated/BaseText';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import ButtonLink from '../dashboard-ui-deprecated/ButtonLink';
import GenericPage from './GenericPage';
import Container from '../dashboard-ui-deprecated/Container';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import { TextInput } from '../dash-ui';

function TokenSection({ title, children }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: 20, marginBottom: 40 }}>
      <Heading>{title}</Heading>
      <View
        style={{
          padding: 40,
          backgroundColor: theme.colors.lightGrey,
          borderRadius: 8,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Forms() {
  const [input, setInput] = React.useState('');
  return (
    <React.Fragment>
      <TextInput value={input} onValue={setInput} label="First Name" />
    </React.Fragment>
  );
}

function Tokens() {
  return (
    <Container style={{ paddingVertical: 100 }}>
      <View>
        <Heading size="large" style={{ marginBottom: 40 }}>
          Design Tokens
        </Heading>
        <TokenSection title="Text Tokens">
          <Heading size="small">Small Heading</Heading>
          <Heading size="medium">Medium Heading</Heading>
          <Heading size="large">Large Heading</Heading>
          <View style={{ height: 40 }} />
          <BodyText>Large Text</BodyText>
          <BaseText size="medium">Medium Text</BaseText>
          <BaseText size="small">Small Text</BaseText>
        </TokenSection>
        <TokenSection title="Button Tokens">
          <ButtonLink title="Default Button" routeName="Tokens" />
        </TokenSection>
        <TokenSection title="Input">
          <Forms />
        </TokenSection>
      </View>
    </Container>
  );
}

function TokensPage() {
  return (
    <GenericPage>
      <Tokens />
    </GenericPage>
  );
}

TokensPage.navigationOptions = {
  title: 'ONO Design Tokens',
};

export default TokensPage;
