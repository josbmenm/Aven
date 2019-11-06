import React from 'react';
import { Image, Text } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import HomeHeader from './HomeHeader';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import PageFooter from './PageFooter';
import HomeSlider from './HomeSlider';
import HowItWorks from './HowItWorks';
import HomeSchedule from './HomeSchedule';
import { aspectRatio169 } from '../components/Styles';
import GenericHeroHeader from './GenericHeroHeader';

function PressLink({ image, url, imageIsGreyscale }) {
  const [isActive, setIsActive] = React.useState(false);
  // img {
  //   -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  //   filter: grayscale(100%);
  // }
  const style = {
    maxWidth: 150,
    objectFit: 'contain',
  };

  if (imageIsGreyscale) {
    style.opacity = isActive ? 1 : 0.8;
  } else {
    style.filter = isActive ? '' : 'grayscale(65%)';
  }
  return (
    <a
      style={{
        display: 'block',
        borderWidth: 1,
        padding: 20,
      }}
      href={url}
      onMouseEnter={() => {
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setIsActive(false);
      }}
      target="_blank"
    >
      <img src={image} style={style} />
    </a>
  );
}

function PressSection() {
  return (
    <React.Fragment>
      <Heading
        size="large"
        style={{ textAlign: 'center' }}
        responsiveStyle={{
          marginBottom: [16, 24],
        }}
      >
        See how the press loves Ono.
      </Heading>
      <Container
        responsiveStyle={{
          marginBottom: [32, 56],
        }}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <PressLink
          image={'/img/press/forbes.com.png'}
          url="https://www.forbes.com/sites/aliciakelso/2019/10/17/ono-food-co-brings-the-restaurant-industry-one-step-closer-to-full-automation/#28dcfbe16d01"
        />
        <PressLink
          image={'/img/press/abc7.com.jpg'}
          url="https://abc7.com/food/-robot-powered-food-trucks-expected-to-hit-la-streets/5623015/"
        />

        <PressLink
          image={'/img/press/cheddar.com.jpg'}
          url="https://cheddar.com/media/ono-food-co-brings-robot-made-smoothies-to-food-truck-scene"
        />

        <PressLink
          image={'/img/press/yahoo.com.png'}
          url="https://finance.yahoo.com/amphtml/news/ono-food-co-launches-world-130000587.html"
        />

        <PressLink
          image={'/img/press/nrn.com.png'}
          url="https://www.nrn.com/technology/food-truck-powered-advanced-robotics-lands-la"
          imageIsGreyscale
        />

        <PressLink
          image={'/img/press/thespoon.tech.png'}
          url="https://thespoon.tech/robot-smoothies-are-just-the-start-for-ono-food-co-s-automated-food-platform/"
        />
        <PressLink
          image={'/img/press/businesswire.com.png'}
          url="https://www.businesswire.com/news/home/20191015005351/en/Ono-Food-Launches-World%E2%80%99s-Mobile-Restaurant-Powered"
        />
        <PressLink
          image={'/img/press/cateringinsight.com.jpg'}
          url="https://usa.cateringinsight.com/la-based-firm-unveils-worlds-first-mobile-restaurant-powered-by-robotic-technology/"
          imageIsGreyscale
        />
      </Container>
    </React.Fragment>
  );
}

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
      <PressSection />
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
