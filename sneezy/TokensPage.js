import React from 'react';
import { View } from 'react-native';
import { Heading, Title, BodyText, FootNote, Button } from './Tokens';
import GenericPage from './GenericPage';
import Container from './Container';
import { useTheme } from './ThemeContext';
import Input from '../components/BlockFormInput'

function TokenSection({ title, children }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: 20, marginBottom: 40 }}>
      <Title>{title}</Title>
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
  const [input, setInput] = React.useState("");
  return (
    <React.Fragment>
      <Input value={input} onValue={setInput} label="First Name" />
    </React.Fragment>
  )
}

function Tokens() {
  return (
    <Container style={{ paddingVertical: 100 }}>
      <View>
        <Heading style={{ marginBottom: 40 }}>Design Tokens</Heading>
        <TokenSection title="Text Tokens">
          <Heading>Heading</Heading>
          <Title>Title</Title>
          <BodyText>Body Text</BodyText>
          <FootNote>Foot Note</FootNote>
        </TokenSection>
        <TokenSection title="Button Tokens">
          <Button title="Default Button" routeName="Tokens" />
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
