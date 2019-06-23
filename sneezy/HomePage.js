import React from 'react';
import { View, Image } from 'react-native';
import GenericPage from './GenericPage';
import HomeHeader from './HomeHeader';
import Container from './Container';
import PageFooter from './PageFooter';
import HomeSlider from './HomeSlider';
import HowItWorks from './HowItWorks';
import HomeShedule from './HomeSchedule';
import { aspectRatio169 } from '../components/Styles';
import GenericHeroHeader from './GenericHeroHeader';

function HomePage() {
  return (
    <GenericPage>
      <HomeHeader />
      {/* Image Full viewport Section */}
      <View style={{ paddingVertical: 90 }}>
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
      <GenericHeroHeader
        title="We believe that good food brings out the best in you."
        bodyText="We believe affordable nutrition should be accessible to everyone. With advanced robotics, thoughtful food sourcing, and nutritious ingredients we’re able to deliver this promise."
      />
      <HomeSlider />
      <HowItWorks />
      <HomeShedule />
      <PageFooter />
    </GenericPage>
  );
}

HomePage.navigationOptions = {
  title: null,
};

export default HomePage;
