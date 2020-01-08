import React from 'react';
import Heading from '../dashboard/Heading';
import { Image } from 'react-native';
import BodyText from '../dashboard/BodyText';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import View from '../views/View';
import Container from '../dashboard/Container';
import ButtonLink from '../dashboard/ButtonLink';
import { absoluteElement } from '../components/Styles';
import {
  ColumnToRow,
  ColumnToRowChild,
  NoFlexToFlex,
} from '../dashboard/Responsive';
import { Responsive } from '../dashboard/Responsive';
import { useTheme } from '../dashboard/Theme';

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
      rel="noopener noreferrer"
    >
      <img src={image} style={style} alt="Current press link" />
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
        some recent coverage.
      </Heading>
      <Container
        responsiveStyle={{
          paddingBottom: [60, 90],
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
const breakpoints = [1024, 1400];

function PressPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <Responsive
        breakpoints={breakpoints}
        style={{
          marginBottom: [30, 60],
        }}
      >
        <View style={{ flex: 1 }}>
          <NoFlexToFlex>
            <Container
              style={{ flex: 1 }}
              responsiveStyle={{
                width: ['100% !important', '100%'],
                marginHorizontal: [0, 28],
              }}
            >
              <ColumnToRow
                columnReverse
                breakpoints={breakpoints}
                style={{
                  flex: 1,
                }}
              >
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    left: [0, -440],
                    bottom: [0, -140],
                  }}
                >
                  <Image
                    className="hide-mobile"
                    source={require('./public/img/fruit_silhouette.png')}
                    style={{
                      ...absoluteElement,
                      zIndex: 0,
                      width: 521,
                      height: 383,
                    }}
                    pointerEvents="none"
                  />
                </Responsive>
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    right: [-440, -440],
                    top: [-156, -140],
                  }}
                >
                  <Image
                    source={require('./public/img/fruit_silhouette.png')}
                    style={{
                      ...absoluteElement,
                      width: 521,
                      height: 383,
                      zIndex: 0,
                    }}
                    pointerEvents="none"
                  />
                </Responsive>
                <ColumnToRowChild>
                  <Responsive
                    breakpoints={breakpoints}
                    style={{
                      paddingTop: [40, 230],
                      paddingRight: [32, 32],
                      paddingBottom: [70, 200],
                      paddingLeft: [32, 100],
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.lightGrey,
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Heading
                        size="large"
                        breakpoints={breakpoints}
                        responsiveStyle={{
                          marginBottom: [16, 26],
                        }}
                      >
                        media kit
                      </Heading>
                      <BodyText
                        responsiveStyle={{
                          marginBottom: [20, 45],
                        }}
                      >
                        Thanks for your interest in Ono Food Co. You can find
                        media assets by clicking the button below, but if you
                        have any questions, feel free to email us at{' '}
                        <a
                          href="mailto:aloha@onofood.co"
                          style={{ fontWeight: 'bold' }}
                        >
                          aloha@onofood.co
                        </a>
                        .
                      </BodyText>

                      <ButtonLink
                        target="_blank"
                        title="download the press kit"
                        url="https://www.dropbox.com/sh/pqovhpomd86tkwv/AAAlWNK8M737FghzfDawT4T7a?dl=0"
                        titleStyle={{ fontSize: 20 }}
                      />
                    </View>
                  </Responsive>
                </ColumnToRowChild>
                <ColumnToRowChild>
                  <Responsive
                    breakpoints={breakpoints}
                    style={{
                      marginHorizontal: [28, 0],
                      marginBottom: [12, 0],
                      width: ['auto', '100%'],
                    }}
                  >
                    <View style={{ width: '100%', flex: 1 }}>
                      <Image
                        source={require('./public/img/OnoLanding.png')}
                        resizeMode="cover"
                        style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
                      />
                    </View>
                  </Responsive>
                </ColumnToRowChild>
              </ColumnToRow>
            </Container>
          </NoFlexToFlex>
        </View>
      </Responsive>
      <PressSection />
      <PageFooter />
    </GenericPage>
  );
}

PressPage.navigationOptions = {
  title: 'Ono and the Press',
};

export default PressPage;
