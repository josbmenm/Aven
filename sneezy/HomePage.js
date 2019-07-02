import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import HomeHeader from './HomeHeader';
import Container from './Container';
import PageFooter from './PageFooter';
import HomeSlider from './HomeSlider';
import HowItWorks from './HowItWorks';
import HomeSchedule from './HomeSchedule';
import { aspectRatio169 } from '../components/Styles';
import GenericHeroHeader from './GenericHeroHeader';
import { Responsive } from '../dashboard/Responsive';

function HomePage() {
  return (
    <GenericPage>
      <HomeHeader />
      {/* Image Full viewport Section */}
      <Responsive
        style={{
          marginBottom: [40, 100],
        }}
      >
        <View>
          <Container>
            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1494989615690-9900562a5b20?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80',
              }}
              resizeMode="cover"
              style={{ ...aspectRatio169 }}
            />
          </Container>
        </View>
      </Responsive>
      <Responsive
        style={{
          marginBottom: [40, 160],
        }}
      >
        <GenericHeroHeader
          title="We believe that good food brings out the best in you."
          bodyText="We believe affordable nutrition should be accessible to everyone. With advanced robotics, thoughtful food sourcing, and nutritious ingredients we’re able to deliver this promise."
        />
      </Responsive>
      <HomeSlider />
      <HowItWorks />
      <HomeSchedule />
      <PageFooter />
    </GenericPage>
  );
}

HomePage.navigationOptions = {
  title: null,
};

export default HomePage;
