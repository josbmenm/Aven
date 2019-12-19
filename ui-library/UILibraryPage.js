import React from 'react';
import { Text } from 'react-native';
import { ThemeProvider, Spacing } from '../dash-ui/Theme';

import Buttons from './Buttons';
import Inputs from './Inputs';
import Links from './Links';
import MultiSelects from './MultiSelects';
import Stack from '../dash-ui/Stack';
import { Layout, Sidebar, Content, Container } from './Layout';
import Heading from '../dash-ui/Heading';

function UILibraryPage() {
  return (
    <ThemeProvider>
      <Layout>
        <Sidebar>
          <Stack>
            <Heading title="UI Library" />
            <Stack inline>
              <Text>Button</Text>
              <Text>Link</Text>
              <Text>Input</Text>
            </Stack>
          </Stack>
        </Sidebar>
        <Content>
          <Container>
            <Buttons />
            <Links />
            <Inputs />
            <MultiSelects />
          </Container>
        </Content>
      </Layout>
    </ThemeProvider>
  );
}

UILibraryPage.navigationOptions = {
  title: 'UI Library',
};

export default UILibraryPage;
