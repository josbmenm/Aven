import React from 'react';
import { Image, Text } from 'react-native';
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
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src="https://www.youtube.com/embed/ppqbNbQ2tB0"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Container>
      </View>
      <GenericHeroHeader
        title="We believe that good food brings out the best in you."
        bodyText="We believe affordable nutrition should be accessible to everyone. With advanced robotics, thoughtful food sourcing, and nutritious ingredients we’re able to deliver this promise."
      />
      <HomeSlider />
      <HowItWorks />
      {/* <HomeSchedule /> */}

      {/* Don't ask why this is necessary. JUST MOVE ON! */}
      <div style={{ position: 'relative' }} />

      <View>
        <Container>
          <Image
            source={require('./public/img/OnoLanding2.png')}
            resizeMode="cover"
            style={{ ...aspectRatio169 }}
          />
        </Container>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

HomePage.navigationOptions = {
  title: 'Organic smoothies from Ono Blends',
  metaDescription:
    "With advanced robotics, thoughtful food sourcing, and nutritious ingredients, we're moving food forward with delicious smoothies that will help you get through your day.",
};

export default HomePage;
