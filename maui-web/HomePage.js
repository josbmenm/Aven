import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import HomeHeader from './HomeHeader';
import Container from '../dashboard/Container';
import PageFooter from './PageFooter';
import HomeSlider from './HomeSlider';
import HowItWorks from './HowItWorks';
import HomeSchedule from './HomeSchedule';
import { aspectRatio169 } from '../components/Styles';
import GenericHeroHeader from './GenericHeroHeader';

function HomePage() {
  return (
    <GenericPage>
      <HomeHeader />
      <View>
        <Container>
          <Image
            source={require('./public/img/OnoLanding2.png')}
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
      <HomeSchedule />
      <PageFooter />
    </GenericPage>
  );
}

HomePage.navigationOptions = {
  title: null,
};

export default HomePage;
