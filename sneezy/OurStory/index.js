import React from 'react';
import { View, Image } from 'react-native';
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Container from '../Container';
import MainMenu from '../MainMenu';

function OurStory() {
  return (
    <GenericPage>
      <View style={{ flex: 1, height: '100vh', paddingBottom: 38 }}>
        <MainMenu />
        <View
          style={{
            flex: 1,
            alignItems: 'stretch',
          }}
        >
          <Container
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'stretch',
              }}
            >
              <View style={{ flex: 1, flexBasis: 0 }}>
                <Image
                  source={{
                    uri:
                      'https://images.unsplash.com/photo-1494989615690-9900562a5b20?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80',
                  }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Container>
        </View>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

OurStory.navigationOptions = {
  title: 'Our Story',
};

export default OurStory;
