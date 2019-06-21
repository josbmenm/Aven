import React from 'react';
import { View, Image } from 'react-native';
import { absoluteElement } from '../components/Styles';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';
import BlendsList from './BlendsList';
import PageFooter from './PageFooter';
import { useTheme } from './ThemeContext';
import { Responsive } from './Responsive';

function Menu() {
  const theme = useTheme();
  return (
    <GenericPage>
      <View style={{ flex: 1, paddingBottom: 38, position: 'relative' }}>
        <GenericHeroHeader
          backgroundColor={theme.colors.lightGrey}
          title="Our Blends"
          bodyText="All of our blends are designed thoughfully to provide you with a
        healthy, balanced, and nutritious meal. All our drinks are made with
        100% organic ingredients, and are guaranteed to make you feel great."
        >
          <Responsive
            style={{
              width: [232, 310],
              height: [302, 403],
              left: [-200, -200],
              top: [-32, -32],
            }}
          >
            <Image
              source={require('./public/img/mint-spinach.png')}
              style={[absoluteElement]}
            />
          </Responsive>
          <Responsive
            style={{
              width: [241, 360],
              height: [320, 480],
              top: [-60, -40],
              right: [-140, -190],
            }}
          >
            <Image
              source={require('./public/img/strawberry.png')}
              style={[absoluteElement]}
            />
          </Responsive>
          <Responsive
            style={{
              width: [284, 341],
              height: [302, 362],
              bottom: [-180, -220],
              left: [-120, 0],
            }}
          >
            <Image
              source={require('./public/img/avocado.png')}
              style={[absoluteElement]}
            />
          </Responsive>
          <Responsive
            style={{
              width: [310, 456],
              height: [206, 304],
              bottom: [-120, -180],
              right: [-40, 50],
            }}
          >
            <Image
              source={require('./public/img/pineapple.png')}
              style={[absoluteElement]}
            />
          </Responsive>
        </GenericHeroHeader>
      </View>
      <BlendsList />
      <PageFooter />
    </GenericPage>
  );
}

Menu.navigationOptions = {
  title: 'Our Blends',
};

export default Menu;
